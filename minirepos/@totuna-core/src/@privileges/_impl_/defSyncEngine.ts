import * as ofColumn from "@privileges/@onColumn";
import * as ofTable from "@privileges/@onTable";
import { TypeOf } from "zod";

type PrivilegeModule = typeof ofColumn | typeof ofTable;

export interface defSyncEngine {
  pullPrivilege: (privilegeModule: PrivilegeModule) => void;
  checkDiff: (privilegeModule: PrivilegeModule) => Promise<{
    additions: TypeOf<PrivilegeModule["StateSchema"]>[];
    removals: TypeOf<PrivilegeModule["StateSchema"]>[];
    revokeRawQueries: string[];
    grantRawQueries: string[];
  }>;
}
