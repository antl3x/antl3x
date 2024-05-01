import * as onColumn from "./@onColumn";
import * as onTable from "./@onTable";

import { _metaUrl_ as onColumnPrivilege } from "@privileges/@onColumn";
import { _metaUrl_ as onTablePrivilege } from "@privileges/@onTable";

export const map = new Map<string, typeof onColumn | typeof onTable>([
  [onColumnPrivilege, onColumn],
  [onTablePrivilege, onTable],
]);
