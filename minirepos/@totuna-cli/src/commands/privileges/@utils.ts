import * as onTable from '@totuna/core/privileges/@onTablePrivilege'
import * as onFunction from '@totuna/core/privileges/@onFunctionPrivilege'
import * as onView from '@totuna/core/privileges/@onViewPrivilege'
import * as onColumn from '@totuna/core/privileges/@onColumnPrivilege'
import * as onSchema from '@totuna/core/privileges/@onSchemaPrivilege'
import * as onDatabase from '@totuna/core/privileges/@onDatabasePrivilege'
import * as onSequence from '@totuna/core/privileges/@onSequencePrivilege'

/* -------------------------------------------------------------------------- */
/*                                    Misc                                    */
/* -------------------------------------------------------------------------- */

export const privileges = {
  onTable,
  onFunction,
  onView,
  onColumn,
  onSchema,
  onDatabase,
  onSequence,
}

export const objectMapping: Record<string, keyof typeof privileges> = {
  table: 'onTable',
  function: 'onFunction',
  view: 'onView',
  column: 'onColumn',
  schema: 'onSchema',
  database: 'onDatabase',
  sequence: 'onSequence',
}
