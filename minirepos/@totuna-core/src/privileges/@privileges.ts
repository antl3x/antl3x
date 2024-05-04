import { satisfies } from "_utils_/_@utils_.js";

import * as onColumn from "./@onColumnPrivilege.js";
import * as onDatabase from "./@onDatabasePrivilege.js";
import * as onFunction from "./@onFunctionPrivilege.js";
import * as onView from "./@onViewPrivilege.js";
import * as onSchema from "./@onSchemaPrivilege.js";
import * as onTable from "./@onTablePrivilege.js";
import * as onSequence from "./@onSequencePrivilege.js";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module, typeof import("./@privileges.js")>;

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
