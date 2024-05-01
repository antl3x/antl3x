import * as ofColumn from "@privileges/@onColumn.js";
import * as ofTable from "@privileges/@onTable.js";
import * as onFunction from "@privileges/@onFunction.js";
import * as onDatabase from "@privileges/@onDatabase.js";
import * as onView from "@privileges/@onView.js";
import * as onSchema from "@privileges/@onSchema.js";
import * as onSequence from "@privileges/@onSequence.js";

import { TypeOf } from "zod";

/* -------------------------------------------------------------------------- */
/*                                defSyncEngine                               */
/* -------------------------------------------------------------------------- */

export interface defSyncEngine {
  pullPrivilege: (privilegeModule: PrivilegeModule) => Promise<void>;
  checkDiff: (privilegeModule: PrivilegeModule) => checkDiffResult;
}

/* ----------------------------- PrivilegeModule ---------------------------- */

type PrivilegeModule =
  | typeof ofColumn
  | typeof ofTable
  | typeof onFunction
  | typeof onDatabase
  | typeof onView
  | typeof onSchema
  | typeof onSequence;

type checkDiffResult = Promise<{
  additions: TypeOf<PrivilegeModule["StateSchema"]>[];
  removals: TypeOf<PrivilegeModule["StateSchema"]>[];
  revokeRawQueries: string[];
  grantRawQueries: string[];
}>;
