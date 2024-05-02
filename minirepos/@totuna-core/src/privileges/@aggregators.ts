import { satisfies } from "_utils_/@utils.js";

import * as onColumn from "./@onColumnAggregator.js";
import * as onDatabase from "./@onDatabaseAggregator.js";
import * as onFunction from "./@onFunctionAggregator.js";
import * as onView from "./@onViewAggregator.js";
import * as onSchema from "./@onSchemaAggregator.js";
import * as onTable from "./@onTableAggregator.js";
import * as onSequence from "./@onSequenceAggregator.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface module {
  onColumn: typeof onColumn;
  onDatabase: typeof onDatabase;
  onFunction: typeof onFunction;
  onView: typeof onView;
  onSchema: typeof onSchema;
  onTable: typeof onTable;
  onSequence: typeof onSequence;
}

satisfies<module>()(import("./@aggregators.js"));

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export { onColumn, onDatabase, onFunction, onView, onSchema, onTable, onSequence };
