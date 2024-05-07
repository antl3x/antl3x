import * as glob from 'glob'
import * as migrationApi from 'migrations/@api.js'
import fs from 'node:fs'
import path from 'node:path'
import ora from 'ora'
import {BaseCommand} from './BaseCommand.js'

/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Plan and apply migration files to the remote database.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    try {
      const spinner = ora()

      const migrationPlanFiles = glob.sync(`${this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PLAN_PATH}/*.sql`)
      // order by filename
      migrationPlanFiles.sort((a, b) => {
        const aId = parseInt(path.basename(a).split('_')[0])
        const bId = parseInt(path.basename(b).split('_')[0])
        return aId - bId
      })

      if (migrationPlanFiles.length === 0) {
        if (!this.flags.json) {
          spinner.info(`\x1b[90m No migration plan files found.\x1b[0m`)
        }
        return []
      }

      for (const migrationPlanFile of migrationPlanFiles) {
        const migrationPlan = fs.readFileSync(migrationPlanFile, 'utf-8')
        // Append the migration id to the start of the file name
        const nextMigrationFileId = await migrationApi.getNextMigrationSeq('local')
        const migrationFileName = `${nextMigrationFileId}_${path.basename(migrationPlanFile)}`
        const migrationFilePath = path.join(this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH, migrationFileName)

        fs.writeFileSync(migrationFilePath, migrationPlan)
        fs.unlinkSync(migrationPlanFile)
        this.log(`\x1b[90m❯ Moved ${migrationPlanFile} to ${migrationFilePath}\x1b[0m`)
      }

      this.log(`\x1b[90m❯ Running migration files..\x1b[0m`)
      const res = await this.config.runCommand('migrations:run')

      return res
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
