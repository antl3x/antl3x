import * as glob from 'glob'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import {BaseCommand} from './BaseCommand.js'

/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Generate migration plan files given the current local state vs remote database state.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    const migrationFiles: {filePath: string; migrationStatment: any}[] = []
    const spinner = ora()

    try {
      const CRDParsers = this.rootStore.userConfig.CRDs!.parsers
      const CRDs = this.rootStore.userConfig.CRDs!.crds
      await this.config.runCommand('pull', ['--silence'])
      for (const crd of Object.values(CRDs)) {
        let migrationStatment = `-- Migration generated by @TOTUNA CLI\n-- Generated at: ${new Date().toISOString()}\n\n`
        const parser = CRDParsers[crd._kind_]
        // @ts-expect-error
        const diffs = (await crd.$getPreviewPlan(parser)) as Awaited<ReturnType<typeof crd.$getPreviewPlan>>

        if (diffs.length === 0) {
          continue
        }

        migrationStatment += diffs.flatMap((diff) => diff.sqlQuery).join('\n')

        const fileSuffix = `${crd._kind_}.sql`

        // Delete file if file suffix already exists
        glob.sync(`${this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PLAN_PATH}/*${fileSuffix}`).forEach((file) => {
          fs.unlinkSync(file)
        })

        migrationFiles.push({
          filePath: `${this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PLAN_PATH}/${+new Date()}-${fileSuffix}`,
          migrationStatment,
        })
      }

      for (const migrationFile of migrationFiles) {
        fs.mkdirSync(path.dirname(migrationFile.filePath), {recursive: true})
        fs.writeFileSync(migrationFile.filePath, migrationFile.migrationStatment)
        if (!this.flags.silence || !this.flags.json) {
          this.log(`❯ Migration plan file created at: ${migrationFile.filePath}`)
        }
      }

      if (migrationFiles.length === 0) {
        if (!this.flags.silence && !this.flags.json) {
          spinner.info('\x1b[90m No differences found between the local files and the remote database. 🎉\x1b[0m')
        }
      }

      return migrationFiles
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
