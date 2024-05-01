import { getRootStore } from "@rootStore";
import { map as aggregatorsMap } from "@aggregators/@map";

import fs from "fs";
import path from "path";
import { defSyncEngine } from "./_impl_/defSyncEngine";
import { diffArr } from "@utils";
import { TypeOf } from "zod";

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
