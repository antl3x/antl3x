import {BaseCommand} from 'commands/BaseCommand.js'
import fs from 'fs'
import * as migrations from 'migrations/@api.js'
import path from 'path'

import ora from 'ora'
import {logger} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                  Command                                   */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  static override description = 'Pull all the remote migrations executed and save them to the local migrations folder.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    const silenceLogs = this.flags.silence || this.flags.json
    const spinner = ora()

    try {
      if (!silenceLogs) {
        this.log(`\x1b[90m❯ Pulling migration files from the database..\x1b[0m`)
      }

      const res = await migrations.$pullMigrations()

      if (!Array.isArray(res) && res._kind_ === 'MigrationsTableDoesNotExist') {
        if (!silenceLogs) {
          spinner.fail('Migrations table does not exist. Run `totuna migrations run` to create the table.')
        }
        return res
      }

      if (!Array.isArray(res)) return []

      if (res.length == 0 && !silenceLogs) {
        spinner.info(`\x1b[90m No migrations found to pull.\x1b[0m`)
      }

      for (const migration of res) {
        const fileName = migration.id + '_' + migration.name + '.sql'
        const filePath = path.join(this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH, fileName)
        fs.mkdirSync(this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH, {recursive: true})
        fs.writeFileSync(filePath, migration.content)
        if (!silenceLogs) {
          this.log(`Migration file pulled: ${fileName} saved to ${filePath}`)
        }
      }

      return res
    } catch (error) {
      spinner.fail('Failed to execute migrations.')
      throw new Error(`Failed to execute migrations: ${error}`, {cause: error})
    }
  }
}
