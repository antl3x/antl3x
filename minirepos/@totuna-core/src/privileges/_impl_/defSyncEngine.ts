import * as ofColumn from "privileges/@onColumnPrivilege.js";
import * as ofTable from "privileges/@onTablePrivilege.js";
import * as onFunction from "privileges/@onFunctionPrivilege.js";
import * as onDatabase from "privileges/@onDatabasePrivilege.js";
import * as onView from "privileges/@onViewPrivilege.js";
import * as onSchema from "privileges/@onSchemaPrivilege.js";
import * as onSequence from "privileges/@onSequencePrivilege.js";

import { TypeOf } from "zod";

/* -------------------------------------------------------------------------- */
/*                                defSyncEngine                               */
/* -------------------------------------------------------------------------- */

export interface defSyncEngine {
  pullPrivilege: pullPrivilege;
  checkDiff: checkDiff;
  generateMigrationFile: generateMigrationFile;
}

/* ------------------------------ pullPrivilege ----------------------------- */

type pullPrivilege = (privilegeModule: PrivilegeModule) => Promise<void>;

/* -------------------------------- checkDiff ------------------------------- */

type checkDiff = (privilegeModule: PrivilegeModule) => Promise<{
  additions: TypeOf<PrivilegeModule["StateSchema"]>[];
  removals: TypeOf<PrivilegeModule["StateSchema"]>[];
  revokeRawQueries: string[];
  grantRawQueries: string[];
}>;

/* -------------------------- generateMigrationFile ------------------------- */
/**
 * Generates a migration file based on the diff between the internal and public state files.
 * It's a single migration file for all the privileges changes.
 */
type generateMigrationFile = () => Promise<
  | {
      _metaType_: "NoChangesToApply";
    }
  | {
      _metaType_: "ChangesToApply";
      fileName: string;
      fileContent: string;
    }
>;

/* ----------------------------- PrivilegeModule ---------------------------- */

type PrivilegeModule =
  | typeof ofColumn
  | typeof ofTable
  | typeof onFunction
  | typeof onDatabase
  | typeof onView
  | typeof onSchema
  | typeof onSequence;
