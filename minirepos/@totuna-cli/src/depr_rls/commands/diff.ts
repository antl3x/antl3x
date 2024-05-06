import {Table} from 'console-table-printer'

import * as atRLSApi from '@totuna/core/rls/@api'

import {BaseCommand} from 'base.js'

/* -------------------------------------------------------------------------- */
/*                               RLSDiff                               */
/* -------------------------------------------------------------------------- */

export default class RLSDiff extends BaseCommand<typeof RLSDiff> {
  public static enableJsonFlag = true
  static override description = 'Diff local and remote privilege states to compare'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    try {
      const diffs = await atRLSApi.checkDiff()
      const table = new Table()

      // Add Rows
      for (const diff of diffs) {
        table.addRow(_parseRow(diff), {
          color: diff.localState === 'Absent' ? 'red' : diff.remoteState === 'Absent' ? 'green' : 'yellow',
        })
      }

      // Order table by color
      table.table.rows.sort((a: any, b: any) => {
        return a.color === 'red' || a.color === 'yellow' ? -1 : a.color === 'green' ? 1 : 0
      })

      // Print Table
      if (table.table.rows.length > 0 && !this.flags.json) {
        table.printTable()
        this.log(`Color Legend:`)

        this.log(`\x1b[31m%s\x1b[0m`, '■: To be removed from the remote database')
        this.log(`\x1b[33m%s\x1b[0m`, '■: To be updated in the remote database')
        this.log(`\x1b[32m%s\x1b[0m`, '■: To be added to the remote database')
      }

      if (diffs.length === 0) {
        this.log('Remote database is in sync with local state. 🎉')
      }

      return diffs
    } catch (error) {
      throw new Error(`Failed to check diff: ${error}`, {cause: error})
    }
  }
}

/* -------------------------------- _parseRow ------------------------------- */

const _parseRow = (diff: any) => {
  return {
    'Local State': diff.localState,
    'Remote State': diff.remoteState,
    Plan: diff.plan,
    'Policy Name': diff?.policyName ?? '-',
    'Target Table': diff?.targetTable ?? '-',
    'On Command': diff?.onCommand ?? '-',
    'Apply To': diff?.applyTo ?? '-',
  }
}
