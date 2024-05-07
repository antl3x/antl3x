import {BaseCommand} from './BaseCommand.js'
import * as CRDs from 'CRD/@crds.js'
import * as CRDYAMLParsers from 'CRD/@crdParsers.js'
import fs from 'node:fs'
import path from 'node:path'
import {Table} from 'console-table-printer'

/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Compare current local state with remote state.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    this.log(`\x1b[90m❯ Pulling the latest state from the remote database..\x1b[0m`)
    await this.config.runCommand('pull', ['--silence'])
    let jsonRes = []
    try {
      for (const crd of Object.values(CRDs)) {
        const parser = CRDYAMLParsers[`CRDParser_${crd._kind_}_YAML`]
        const diffs = await crd.$getPreviewPlan(parser)
        jsonRes.push(diffs)

        const table = new Table()

        // Add Rows
        for (const diff of diffs) {
          table.addRow(
            {
              'Local State': diff.localState,
              'Remote State': diff.remoteState,
              'Object Type': diff.objectType,
              'Object Path': diff.objectPath,
              Plan: diff.plan,
              'New State': diff.newState,
              'Old State': diff.oldState,
            },
            {
              color: diff.localState === 'Absent' ? 'red' : diff.remoteState === 'Absent' ? 'green' : 'yellow',
            },
          )
        }

        // Order table by "Object Type" and also by color
        table.table.rows.sort((a: any, b: any) => {
          return a['Object Type'] < b['Object Type']
            ? -1
            : a['Object Type'] > b['Object Type']
            ? 1
            : a.color === 'red' || a.color === 'yellow'
            ? -1
            : a.color === 'green'
            ? 1
            : 0
        })

        // Print Table
        if (table.table.rows.length > 0 && !this.flags.json) {
          table.printTable()
          this.log(`\nColor Legend:`)

          this.log(`\x1b[31m%s\x1b[0m`, '■: To be removed from the remote database')
          this.log(`\x1b[33m%s\x1b[0m`, '■: To be updated in the remote database')
          this.log(`\x1b[32m%s\x1b[0m`, '■: To be added to the remote database')
        }
      }

      if (jsonRes.flat().length === 0) {
        this.log('No differences found between the local files and the remote database. 🎉')
      }

      return jsonRes
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
