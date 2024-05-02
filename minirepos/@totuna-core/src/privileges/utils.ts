import * as onColumn from "./@onColumnPrivilege.js";
import * as onTable from "./@onTablePrivilege.js";
import * as onFunction from "./@onFunctionPrivilege.js";
import * as onDatabase from "./@onDatabasePrivilege.js";
import * as onView from "./@onViewPrivilege.js";
import * as onSchema from "./@onSchemaPrivilege.js";
import * as onSequence from "./@onSequencePrivilege.js";

/* -------------------------------------------------------------------------- */
/*                                   privMap                                  */
/* -------------------------------------------------------------------------- */
/**
 * A map of all the privileges modules.
 */
export const privMap = new Map<
  string,
  typeof onColumn | typeof onTable | typeof onFunction | typeof onDatabase | typeof onView | typeof onSchema | typeof onSequence
>([
  [onColumn._metaId_, onColumn],
  [onTable._metaId_, onTable],
  [onFunction._metaId_, onFunction],
  [onDatabase._metaId_, onDatabase],
  [onView._metaId_, onView],
  [onSchema._metaId_, onSchema],
  [onSequence._metaId_, onSequence],
]);
