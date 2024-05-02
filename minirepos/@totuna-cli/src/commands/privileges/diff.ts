import {Args, Flags} from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'
import {printTable, Table} from 'console-table-printer'

import * as atPrivilegeApi from '@totuna/core/privileges/@api'

import {BaseCommand} from '../../base.js'
import {objectMapping, privileges} from './@utils.js'
import {logger} from '@log.js'

/* -------------------------------------------------------------------------- */
/*                               PrivilegesSync                               */
/* -------------------------------------------------------------------------- */

export default class PrivilegesSync extends BaseCommand<typeof PrivilegesSync> {
  static override args = {
    object: Args.string({
      description: 'The privilege object to diff.',
      default: 'all',
      options: ['all', ...Object.keys(objectMapping)],
    }),
  }

  static override description = 'Diff local and remote privilege states to compare'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run(): Promise<void> {
    logger.debug('Running pull command')

    let totalAdds = 0
    let totalRemoves = 0

    const p = new Table()

    if (this.args.object !== 'all') {
      const module = privileges[objectMapping[this.args.object]]
      const {grantRawQueries, revokeRawQueries} = await atPrivilegeApi.checkDiff(module)
    } else {
      await Promise.all(
        Object.values(objectMapping).map(async (object) => {
          const module = privileges[object]
          const {additions, removals} = await atPrivilegeApi.checkDiff(module)

          additions.forEach((res: any) => {
            totalAdds++
            addTableRow(p, object, res, 'green', 'GRANT')
          })

          removals.forEach((res: any) => {
            totalRemoves++
            addTableRow(p, object, res, 'red', 'REVOKE')
          })

          p.table.sortFunction = (a, b) => a['GRANT / REVOKE'].localeCompare(b['GRANT / REVOKE'])
        }),
      )

      if (p.table.rows.length > 0) {
        p.printTable()
      }

      this.log(
        `Diff result found: ${
          totalAdds > 0 ? `\x1b[1m\x1b[92m${totalAdds} \x1b[0m\x1b[92madditions\x1b[0m` : '0 additions'
        } and ${totalRemoves > 0 ? `\x1b[1m\x1b[31m${totalRemoves} \x1b[0m\x1b[31mremovals\x1b[0m` : '0 removals'}.`,
      )
    }
  }
}

/* ------------------------------- addTableRow ------------------------------ */

function addTableRow(p: Table, object: string, res: any, color: string, action: 'GRANT' | 'REVOKE') {
  const rowData = {
    ' ': action === 'GRANT' ? ' + ' : ' - ',
    'GRANT / REVOKE': action,
    Privilege: getPrivilege(object, res),
    In: object.slice(2),
    Name: getName(object, res),
    'To Role': res?.grantee,
  }
  p.addRow(rowData, {color})
}

/* ------------------------------ getPrivilege ------------------------------ */

function getPrivilege(object: string, res: any) {
  switch (object) {
    case 'onColumn':
      return res?.privilege_type + ' (' + res?.column_name + ')'
    case 'onFunction':
    case 'onSchema':
    case 'onView':
    case 'onSequence':
      return res?.privilege
    default:
      return res?.privilege_type
  }
}

/* --------------------------------- getName -------------------------------- */

function getName(object: string, res: any) {
  switch (object) {
    case 'onColumn':
    case 'onTable':
      return res?.table_schema + '.' + res?.table_name
    case 'onFunction':
    case 'onView':
    case 'onSequence':
      return res?.schema + '.' + res?.[object.slice(2).toLowerCase()]
    case 'onDatabase':
      return res?.database
    case 'onSchema':
      return res?.schema
    default:
      return ''
  }
}
