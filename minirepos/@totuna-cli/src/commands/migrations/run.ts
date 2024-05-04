import * as api from '@totuna/core/privileges/@api'
import * as migrations from '@totuna/core/migrations/@api'
import fs from 'fs'
import path from 'path'
import {BaseCommand} from '../../base.js'

import {logger} from '@log.js'
import {Args} from '@oclif/core'
import ora from 'ora'

/* -------------------------------------------------------------------------- */
/*                                MigrationRun                                */
/* -------------------------------------------------------------------------- */

export default class MigrationRun extends BaseCommand<typeof MigrationRun> {
  static override description = 'Run all the migrations'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override args = {
    plan: Args.boolean({
      description: 'Execute all migrations, including those located in the /plan folder.',
      default: false,
    }),
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run(): Promise<void> {
    logger.debug('Running migrations.')
    const spinner = ora().start()

    if (this.args.plan) {
      spinner.text = 'Fetching migrations from plan folder..'

      // Get last migration Id to rename plan files
      const nextMigID = await migrations.getNextMigrationSeq('local')
      // Rename plan files
      const planPath = this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PLAN_PATH
      const migrationsPath = this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH

      // Get plan files and their stats
      const planFiles = fs.readdirSync(planPath).map((file) => {
        return {
          name: file,
          time: fs.statSync(path.join(planPath, file)).birthtime,
        }
      })

      // Sort files by creation time
      planFiles.sort((a, b) => a.time.getTime() - b.time.getTime())

      for (const planFile of planFiles) {
        const planFilePath = path.join(planPath, planFile.name)
        const newPlanFile = `${nextMigID}_${new Date().getTime()}_${planFile.name}`
        const newPlanFilePath = path.join(migrationsPath, newPlanFile)
        fs.renameSync(planFilePath, newPlanFilePath)
      }
    }

    // Run migrations
    spinner.text = 'Executing migrations..'

    const res = await migrations.migrate()

    spinner.succeed('Migrations executed successfully!')
  }
}
