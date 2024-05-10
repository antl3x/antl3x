import * as CRDYAMLParsers from 'CRDs/@crdParsers.js'
import * as CRDs from 'CRDs/@crds.js'
import {Table} from 'console-table-printer'
import ora from 'ora'
import {BaseCommand} from './BaseCommand.js'

/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Show the differences between the local files and the remote database.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    const parser = this.rootStore.userConfig.tsOptions.parser
    const CRDs = this.rootStore.userConfig.tsOptions.crds

    const spinner = ora()
    this.log(`\x1b[90m❯ Pulling the latest state from the remote database..\x1b[0m`)
    await this.config.runCommand('pull', ['--silence'])
    let jsonRes = []
    const table = new Table()

    try {
      for (const crd of Object.values(CRDs)) {
        const localStateObjects = await parser.$fetchLocalStates(crd)
        const diffs = await crd.$getPreviewPlan(localStateObjects)
        jsonRes.push(diffs)

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

      if (jsonRes.flat().length === 0) {
        if (!this.flags.json) {
          spinner.info('\x1b[90m No differences found between the local files and the remote database. 🎉\x1b[0m')
        }
      }

      return jsonRes
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
