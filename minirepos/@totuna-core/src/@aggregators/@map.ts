import * as onColumn from "./@onColumn.js";
import * as onTable from "./@onTable.js";
import * as onFunction from "./@onFunction.js";
import * as onDatabase from "./@onDatabase.js";
import * as onView from "./@onView.js";
import * as onSchema from "./@onSchema.js";
import * as onSequence from "./@onSequence.js";

import { _metaId_ as onColumnPrivilege } from "@privileges/@onColumn.js";
import { _metaId_ as onTablePrivilege } from "@privileges/@onTable.js";
import { _metaId_ as onFunctionPrivilege } from "@privileges/@onFunction.js";
import { _metaId_ as onDatabasePrivilege } from "@privileges/@onDatabase.js";
import { _metaId_ as onViewPrivilege } from "@privileges/@onView.js";
import { _metaId_ as onSchemaPrivilege } from "@privileges/@onSchema.js";
import { _metaId_ as onSequencePrivilege } from "@privileges/@onSequence.js";

export const map = new Map<
  string,
  typeof onColumn | typeof onTable | typeof onFunction | typeof onDatabase | typeof onView | typeof onSchema | typeof onSequence
>([
  [onColumnPrivilege, onColumn],
  [onTablePrivilege, onTable],
  [onFunctionPrivilege, onFunction],
  [onDatabasePrivilege, onDatabase],
  [onViewPrivilege, onView],
  [onSchemaPrivilege, onSchema],
  [onSequencePrivilege, onSequence],
]);
