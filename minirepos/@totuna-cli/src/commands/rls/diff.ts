import {Table} from 'console-table-printer'
import {z} from 'zod'

import * as atRLSApi from '@totuna/core/rls/@api'

import {logger} from '@log.js'
import {BaseCommand} from '../../base.js'

/* -------------------------------------------------------------------------- */
/*                               RLSDiff                               */
/* -------------------------------------------------------------------------- */

export default class RLSDiff extends BaseCommand<typeof RLSDiff> {
  static override description = 'Diff local and remote privilege states to compare'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  /* ----------------------------------- run ---------------------------------- */

  public async run(): Promise<void> {
    let totalPoliciesToBeAdded = 0
    let totalPoliciesToBeRemoved = 0
    let totalPoliciesToBeUpdated = 0
    let totalTablesToRLSBeEnabled = 0
    let totalTablesToRLSBeDisabled = 0

    const diffs = await atRLSApi.checkDiff()
    const table = new Table()

    // Policy State Diffs
    for (const add of diffs.policyStateDiff.additions) {
      const isUpdate = diffs.rawQueries.has(`dropPolicy:${add.schema}.${add.table}.${add.name}`)
      if (isUpdate) {
        totalPoliciesToBeUpdated++
        table.addRow(_RowDataSchema.parse({type: 'modification', row: add}), {color: 'yellow'})
      } else {
        totalPoliciesToBeAdded++
        table.addRow(_RowDataSchema.parse({type: 'addition', row: add}), {color: 'green'})
      }
    }

    for (const remove of diffs.policyStateDiff.removals) {
      const isUpdate = diffs.rawQueries.has(`createPolicy:${remove.schema}.${remove.table}.${remove.name}`)
      if (isUpdate) {
        continue
      }
      totalPoliciesToBeRemoved++
      table.addRow(_RowDataSchema.parse({type: 'removal', row: remove}), {color: 'red'})
    }

    // Table RLS State Diffs
    for (const enable of diffs.tableStateDiff.additions) {
      totalTablesToRLSBeEnabled++
      table.addRow(
        {
          'Local State': 'Present',
          'Remote State': 'Absent',
          Plan: 'Enable RLS',
          'Target Table': `${enable.schema}.${enable.table}`,
          'Policy Name': '-',
          'On Command': '-',
          'Apply To': '-',
        },
        {color: 'green'},
      )
    }

    for (const disable of diffs.tableStateDiff.removals) {
      totalTablesToRLSBeDisabled++
      table.addRow(
        {
          'Local State': 'Absent',
          'Remote State': 'Present',
          Plan: 'Disable RLS',
          'Target Table': `${disable.schema}.${disable.table}`,
          'Policy Name': '-',
          'On Command': '-',
          'Apply To': '-',
        },
        {color: 'red'},
      )
    }

    // Print Table
    if (table.table.rows.length > 0) {
      table.printTable()
    }

    const totalPolicyChanges = totalPoliciesToBeAdded + totalPoliciesToBeRemoved + totalPoliciesToBeUpdated
    const totalTableChanges = totalTablesToRLSBeEnabled + totalTablesToRLSBeDisabled

    if (totalPolicyChanges > 0) {
      this.log(`Total of ${totalPolicyChanges} policies to be added, removed or updated in remote database.`)
    }

    if (totalTableChanges > 0) {
      this.log(`Total of ${totalTableChanges} tables to be enabled or disabled for RLS in remote database.`)
    }

    if (totalPolicyChanges === 0 && totalTableChanges === 0) {
      this.log('Remote database is in sync with local state. 🎉')
    }
  }
}

/* ------------------------------- addTableRow ------------------------------ */

const _RowDataSchema = z
  .object({
    type: z.enum(['addition', 'removal', 'modification']),
    row: z.object({
      name: z.string().optional(),
      schema: z.string().optional(),
      table: z.string().optional(),
      for: z.string().optional(),
      to: z.array(z.string()).optional(),
    }),
  })
  .transform(({type, row}: {type: 'addition' | 'removal' | 'modification'; row: any}) => ({
    'Local State': type === 'addition' ? 'Present' : type === 'removal' ? 'Absent' : 'Different',
    'Remote State': type === 'addition' ? 'Absent' : type === 'removal' ? 'Present' : 'Different',
    Plan: type === 'addition' ? 'Create' : type === 'removal' ? 'Drop' : 'Update',
    'Policy Name': row.name ?? '-',
    'Target Table': row.schema && row.table ? `${row.schema}.${row.table}` : '-',
    'On Command': row.for ?? '-',
    'Apply To': row.to?.join(', ') ?? '-',
  }))
