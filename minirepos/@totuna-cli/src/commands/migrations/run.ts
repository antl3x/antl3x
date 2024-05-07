import {BaseCommand} from 'commands/BaseCommand.js'
import fs from 'fs'
import * as migrations from 'migrations/@api.js'
import path from 'path'

import {Args} from '@oclif/core'
import ora from 'ora'
import {logger} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                  Command                                   */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  static override description = 'Run all the migrations'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override args = {
    plan: Args.boolean({
      description: 'Execute all migrations, including those located in the /plan folder.',
      default: false,
    }),
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    const spinner = ora()

    try {
      logger.debug('Running migrations.')

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
      if (res.length > 0) {
        res.forEach((migration) => {
          this.log(`\x1b[32m✔ Migration file executed: ${migration.fileName}\x1b[0m`)
        })
        spinner.succeed('Migrations executed successfully!')
      } else {
        if (!this.flags.json) {
          spinner.info('\x1b[90m No migrations to execute.\x1b[0m')
        }
      }

      return res
    } catch (error) {
      spinner.fail('Failed to execute migrations.')
      throw new Error(`Failed to execute migrations: ${error}`, {cause: error})
    }
  }
}
