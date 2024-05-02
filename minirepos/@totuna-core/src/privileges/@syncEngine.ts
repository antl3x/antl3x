import { getRootStore } from "@rootStore.js";
import { map as aggregatorsMap } from "./@aggregators.js";

import fs from "fs";
import path from "path";
import type { defSyncEngine } from "./_impl_/defSyncEngine.js";
import { diffArr, satisfies } from "_utils_/@utils.js";
import { TypeOf } from "zod";
import { privMap } from "./utils.js";
import * as migrationsEngine from "migrations/@api.js";

satisfies<typeof import("./@syncEngine.js")>()<defSyncEngine>;

/* ------------------------------ pullPrivilege ----------------------------- */

export const pullPrivilege: defSyncEngine["pullPrivilege"] = async (privMod) => {
  const { pgClient } = await getRootStore();

  const privStates = (await privMod.pullQuery(pgClient.query.bind(pgClient)))?.rows.map((row) => privMod.StateSchema.parse(row));

  const INTERNAL_STATE_FILE_PATH = await privMod.INTERNAL_STATE_FILE_PATH();
  const INTERNAL_STATE_FOLDER_PATH = await privMod.INTERNAL_STATE_FOLDER_PATH();
  const PUBLIC_STATE_FILE_PATH = await privMod.PUBLIC_STATE_FILE_PATH();

  // Remove all state files first
  if (fs.existsSync(INTERNAL_STATE_FILE_PATH)) {
    fs.rmSync(path.resolve(INTERNAL_STATE_FILE_PATH), { recursive: true });
  }

  if (fs.existsSync(PUBLIC_STATE_FILE_PATH)) {
    fs.rmSync(path.resolve(PUBLIC_STATE_FILE_PATH), { recursive: true });
  }

  // Write Internal State file

  fs.mkdirSync(INTERNAL_STATE_FOLDER_PATH, { recursive: true });
  fs.writeFileSync(INTERNAL_STATE_FILE_PATH, JSON.stringify(privStates, null, 2));

  // Aggregate all state files into one public state file using an Aggregator

  const agg = aggregatorsMap.get(privMod._metaId_);

  if (!agg) throw new Error(`Aggregator not found for ${privMod._metaId_}`);

  // @ts-expect-error - This is a valid call
  const publicStateFiles = agg.aggregatesToFiles(agg.privilegesToAggregates(privStates));

  publicStateFiles.forEach(({ fileName, content }) => {
    fs.mkdirSync(PUBLIC_STATE_FILE_PATH, { recursive: true });
    fs.writeFileSync(path.resolve(PUBLIC_STATE_FILE_PATH, fileName), content);
  });
};

/* -------------------------------- checkDiff ------------------------------- */

export const checkDiff: defSyncEngine["checkDiff"] = async (privMod) => {
  // Define paths
  const INTERNAL_STATE_FILE_PATH = await privMod.INTERNAL_STATE_FILE_PATH();
  const PUBLIC_STATE_FILE_PATH = await privMod.PUBLIC_STATE_FILE_PATH();

  // Grab Aggregator
  const agg = aggregatorsMap.get(privMod._metaId_);
  if (!agg) throw new Error(`Aggregator not found for ${privMod._metaId_}`);

  // Check if folder exists, if not return early

  if (!fs.existsSync(INTERNAL_STATE_FILE_PATH)) {
    return {
      additions: [],
      removals: [],
      revokeRawQueries: [],
      grantRawQueries: [],
    };
  }

  // Parse public state files to Privileges Array
  const publicStateArr = agg.filesToPrivileges(
    fs.readdirSync(PUBLIC_STATE_FILE_PATH).map((fileName) => {
      const content = fs.readFileSync(path.resolve(PUBLIC_STATE_FILE_PATH, fileName), "utf-8");
      return content;
    }),
  );

  // Parse internal state file to Privileges Array
  const internalStateArr = JSON.parse(fs.readFileSync(INTERNAL_STATE_FILE_PATH, "utf-8")) as TypeOf<typeof privMod.StateSchema>[];

  // Do a diff for additions and removals
  const { additions, removals } = diffArr(internalStateArr, publicStateArr);

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

/* -------------------------- generateMigrationFile ------------------------- */
export const generateMigrationFile: defSyncEngine["generateMigrationFile"] = async () => {
  const rootStore = await getRootStore();

  let fileContent = `-- Privileges Migration generated by @totuna
  -- Generated at: ${new Date().toISOString()}`;
  const diffs = await Promise.all([...privMap].map(([, privMod]) => checkDiff(privMod)));

  const changes = diffs.flatMap((diff) => {
    const sections = [];
    if (diff.grantRawQueries.length > 0) {
      sections.push(`-- Grant Statements\n${diff.grantRawQueries.join("\n")}`);
    }
    if (diff.revokeRawQueries.length > 0) {
      sections.push(`-- Revoke Statements\n${diff.revokeRawQueries.join("\n")}`);
    }
    return sections;
  });

  if (changes.length === 0) {
    return {
      _metaType_: "NoChangesToApply" as const,
    };
  }

  fileContent += changes.join("\n");

  const MIGRATIONS_PATH = rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH;
  fs.mkdirSync(MIGRATIONS_PATH, { recursive: true });
  const fileId = await migrationsEngine.getNextMigrationSeq("local");
  const fileName = `${fileId}_privileges_update.totuna.sql`;
  fs.writeFileSync(path.resolve(MIGRATIONS_PATH, fileName), fileContent);

  return {
    _metaType_: "ChangesToApply" as const,
    fileName,
    fileContent,
  };
};