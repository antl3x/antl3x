import { getRootStore } from "@rootStore.js";

import pg from "pg";
import fs from "fs";
import path from "path";
import { diffArr, satisfies } from "_utils_/_@utils_.js";
import { TypeOf } from "zod";

import { module as modulePrivileges } from "./@privileges.js";
import * as atPrivileges from "./@privileges.js";
import * as migrationsEngine from "migrations/@api.js";

import * as atAggregators from "./@aggregators.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module, typeof import("./@api.js")>;

export interface module {
  pullPrivilege: pullPrivilege;
  pullAllPrivileges: pullAllPrivileges;
  checkDiff: checkDiff;
  checkDiffs: checkDiffs;
  generateMigrationPlanFile: generateMigrationPlanFile;
}

/* ------------------------------ pullPrivilege ----------------------------- */

type pullPrivilege = (privilegeModule: modulePrivileges[keyof modulePrivileges], forceWrite: boolean) => Promise<pullPrivilegeRes>;

type pullPrivilegeRes = {
  fileName: string;
  status: "written" | "skipped-diff" | "skipped";
}[];

/* ------------------------------ pullPrivileges ----------------------------- */

type pullAllPrivileges = (forceWrite: boolean) => Promise<pullPrivilegeRes[]>;

/* -------------------------------- checkDiff ------------------------------- */

type checkDiff = (privilegeModule: modulePrivileges[keyof modulePrivileges]) => Promise<checkDiffRes>;

type checkDiffRes = {
  additions: TypeOf<modulePrivileges[keyof modulePrivileges]["StateSchema"]>[];
  removals: TypeOf<modulePrivileges[keyof modulePrivileges]["StateSchema"]>[];
  revokeRawQueries: string[];
  grantRawQueries: string[];
};

/* ------------------------------- checkDiffs ------------------------------- */

type checkDiffs = () => Promise<checkDiffRes[]>;

/* -------------------------- generateMigrationPlanFile ------------------------- */
/**
 * Generates a migration file based on the diff between the internal and public state files.
 * It's a single migration file for all the privileges changes.
 */
type generateMigrationPlanFile = () => Promise<
  | {
      _metaType_: "NoMigrationPlan";
    }
  | {
      _metaType_: "MigrationPlanGenerated";
      fileName: string;
      fileContent: string;
    }
>;

/* -------------------------------------------------------------------------- */
/*                                Implemenation                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------ pullPrivilege ----------------------------- */

export const pullPrivilege: module["pullPrivilege"] = async (privMod) => {
  const { pgClient } = await getRootStore();

  const privStates = await _queryRemoteStates(pgClient, privMod);

  const PUBLIC_STATE_FILE_PATH = await privMod.PUBLIC_STATE_FILE_PATH();

  // Aggregate all state files into one public state file using an Aggregator

  const agg = atAggregators[privMod._metaId_];

  if (!agg) throw new Error(`Aggregator not found for ${privMod._metaId_}`);

  // @ts-expect-error - This is a valid call
  const localStateFiles = agg.genAggregatesFiles(agg.statesToAggregates(privStates));

  return localStateFiles.map(({ fileName, content }) => {
    fs.mkdirSync(PUBLIC_STATE_FILE_PATH, { recursive: true });

    // Check if the file already exists
    if (fs.existsSync(path.resolve(PUBLIC_STATE_FILE_PATH, fileName))) {
      const existingContent = fs.readFileSync(path.resolve(PUBLIC_STATE_FILE_PATH, fileName), "utf-8");

      return {
        fileName,
        status: existingContent === content ? "skipped" : "skipped-diff",
      };
    }

    fs.writeFileSync(path.resolve(PUBLIC_STATE_FILE_PATH, fileName), content);

    return {
      fileName,
      status: "written",
    };
  });
};

/* ---------------------------- pullAllPrivileges --------------------------- */

export const pullAllPrivileges: module["pullAllPrivileges"] = async (forceWrite) => {
  return Promise.all([...Object.values(atPrivileges)].map((privMod) => pullPrivilege(privMod, forceWrite)));
};

/* -------------------------------- checkDiff ------------------------------- */

export const checkDiff: module["checkDiff"] = async (privMod) => {
  // Define paths
  const PUBLIC_STATE_FILE_PATH = await privMod.PUBLIC_STATE_FILE_PATH();

  // Grab Aggregator
  const agg = atAggregators[privMod._metaId_];
  if (!agg) throw new Error(`Aggregator not found for ${privMod._metaId_}`);

  // Fetch remote states
  const { pgClient } = await getRootStore();
  const remoteStates = await _queryRemoteStates(pgClient, privMod);

  if (remoteStates.length === 0) {
    return {
      additions: [],
      removals: [],
      revokeRawQueries: [],
      grantRawQueries: [],
    };
  }

  // If dir does not exists we automatically pull the privilege
  if (!fs.existsSync(PUBLIC_STATE_FILE_PATH)) {
    await pullPrivilege(privMod, true);
  }

  // Parse public state files to Privileges Array
  const localStates = await agg.aggFilesToStates(
    fs.readdirSync(PUBLIC_STATE_FILE_PATH).map((fileName) => {
      const content = fs.readFileSync(path.resolve(PUBLIC_STATE_FILE_PATH, fileName), "utf-8");
      return [path.resolve(PUBLIC_STATE_FILE_PATH, fileName), content];
    }),
  );

  // Do a diff for additions and removals
  const { additions, removals } = diffArr(remoteStates, localStates);

  // Generate revoke and grant raw queries
  // @ts-expect-error - This is a valid call
  const revokeRawQueries = removals.map((state) => privMod.revokeRawQuery(state));
  // @ts-expect-error - This is a valid call
  const grantRawQueries = additions.map((state) => privMod.grantRawQuery(state));

  return {
    additions,
    removals,
    revokeRawQueries,
    grantRawQueries,
  };
};

/* ------------------------------- checkDiffs ------------------------------- */

export const checkDiffs: module["checkDiffs"] = async () => {
  return Promise.all([...Object.values(atPrivileges)].map((privMod) => checkDiff(privMod)));
};

/* -------------------------- generateMigrationPlanFile ------------------------- */
export const generateMigrationPlanFile: module["generateMigrationPlanFile"] = async () => {
  const rootStore = await getRootStore();

  let fileContent = `-- Privileges Migration Plan generated by @totuna
  -- Generated at: ${new Date().toISOString()}`;
  const diffs = await Promise.all([...Object.values(atPrivileges)].map((privMod) => checkDiff(privMod)));

  const changes = diffs.flatMap((diff) => {
    const sections = [];
    if (diff.grantRawQueries.length > 0) {
      sections.push(`-- Grant Statements\n${diff.grantRawQueries.join("\n")}\n`);
    }
    if (diff.revokeRawQueries.length > 0) {
      sections.push(`-- Revoke Statements\n${diff.revokeRawQueries.join("\n")}\n`);
    }
    return sections;
  });

  if (changes.length === 0) {
    return {
      _metaType_: "NoMigrationPlan" as const,
    };
  }

  fileContent += changes.join("\n");

  const MIGRATIONS_PLAN_PATH = rootStore.systemVariables.PUBLIC_MIGRATIONS_PLAN_PATH;
  fs.mkdirSync(MIGRATIONS_PLAN_PATH, { recursive: true });

  const fileName = `privileges.sql`;
  fs.writeFileSync(path.resolve(MIGRATIONS_PLAN_PATH, fileName), fileContent);

  return {
    _metaType_: "MigrationPlanGenerated" as const,
    fileName,
    fileContent,
  };
};

/* --------------------------- _queryRemoteStates --------------------------- */

const _queryRemoteStates = async (pgClient: pg.Client, privMod: modulePrivileges[keyof modulePrivileges]) =>
  (await privMod.pullQuery(pgClient.query.bind(pgClient)))?.rows.map((row) => privMod.StateSchema.parse(row));
