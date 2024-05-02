import * as onColumn from "./@onColumnAggregator.js";
import * as onTable from "./@onTableAggregator.js";
import * as onFunction from "./@onFunctionAggregator.js";
import * as onDatabase from "./@onDatabaseAggregator.js";
import * as onView from "./@onViewAggregator.js";
import * as onSchema from "./@onSchemaAggregator.js";
import * as onSequence from "./@onSequenceAggregator.js";

import { _metaId_ as onColumnPrivilege } from "./@onColumnPrivilege.js";
import { _metaId_ as onTablePrivilege } from "./@onTablePrivilege.js";
import { _metaId_ as onFunctionPrivilege } from "./@onFunctionPrivilege.js";
import { _metaId_ as onDatabasePrivilege } from "./@onDatabasePrivilege.js";
import { _metaId_ as onViewPrivilege } from "./@onViewPrivilege.js";
import { _metaId_ as onSchemaPrivilege } from "./@onSchemaPrivilege.js";
import { _metaId_ as onSequencePrivilege } from "./@onSequencePrivilege.js";

import { satisfies } from "_utils_/@utils.js";
import { defAggregators } from "./@aggregators.d.js";
import { defAggregator } from "./@aggregator.def.js";

satisfies<defAggregators>()(import("./@aggregators.js"));

/* -------------------------------------------------------------------------- */
/*                                 Aggregators                                */
/* -------------------------------------------------------------------------- */

export { onSequence, onSchema, onView, onDatabase, onFunction, onTable, onColumn };

export const map: defAggregators["map"] = new Map<string, defAggregator<unknown, unknown>>([
  [onColumnPrivilege, onColumn],
  [onTablePrivilege, onTable],
  [onFunctionPrivilege, onFunction],
  [onDatabasePrivilege, onDatabase],
  [onViewPrivilege, onView],
  [onSchemaPrivilege, onSchema],
  [onSequencePrivilege, onSequence],
]);
