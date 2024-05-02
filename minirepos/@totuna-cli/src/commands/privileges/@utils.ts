import * as onTable from '@totuna/core/@privileges/@onTable'
import * as onFunction from '@totuna/core/@privileges/@onFunction'
import * as onView from '@totuna/core/@privileges/@onView'
import * as onColumn from '@totuna/core/@privileges/@onColumn'
import * as onSchema from '@totuna/core/@privileges/@onSchema'
import * as onDatabase from '@totuna/core/@privileges/@onDatabase'
import * as onSequence from '@totuna/core/@privileges/@onSequence'

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
