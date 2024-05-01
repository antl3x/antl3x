import * as onColumn from "./@onColumn";
import * as onTable from "./@onTable";
import * as onFunction from "./@onFunction";
import * as onDatabase from "./@onDatabase";
import * as onView from "./@onView";
import * as onSchema from "./@onSchema";
import * as onSequence from "./@onSequence";

import { _metaId_ as onColumnPrivilege } from "@privileges/@onColumn";
import { _metaId_ as onTablePrivilege } from "@privileges/@onTable";
import { _metaId_ as onFunctionPrivilege } from "@privileges/@onFunction";
import { _metaId_ as onDatabasePrivilege } from "@privileges/@onDatabase";
import { _metaId_ as onViewPrivilege } from "@privileges/@onView";
import { _metaId_ as onSchemaPrivilege } from "@privileges/@onSchema";
import { _metaId_ as onSequencePrivilege } from "@privileges/@onSequence";

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
