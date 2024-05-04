import { satisfies } from "_utils_/_@utils_.js";

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

satisfies<module, typeof import("./@aggregators.js")>;

export interface module {
  onColumn: typeof onColumn;
  onDatabase: typeof onDatabase;
  onFunction: typeof onFunction;
  onView: typeof onView;
  onSchema: typeof onSchema;
  onTable: typeof onTable;
  onSequence: typeof onSequence;
}

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export { onColumn, onDatabase, onFunction, onView, onSchema, onTable, onSequence };
