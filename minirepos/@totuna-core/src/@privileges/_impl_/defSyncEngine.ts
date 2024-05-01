import * as ofColumn from "@privileges/@onColumn";
import * as ofTable from "@privileges/@onTable";
import * as onFunction from "@privileges/@onFunction";
import * as onDatabase from "@privileges/@onDatabase";
import * as onView from "@privileges/@onView";
import * as onSchema from "@privileges/@onSchema";
import * as onSequence from "@privileges/@onSequence";

import { TypeOf } from "zod";

/* -------------------------------------------------------------------------- */
/*                                defSyncEngine                               */
/* -------------------------------------------------------------------------- */

export interface defSyncEngine {
  pullPrivilege: (privilegeModule: PrivilegeModule) => void;
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
