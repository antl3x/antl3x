import * as syncEngine from '@totuna/core/privileges/@api'
import {BaseCommand} from '../../base.js'

import {logger} from '@log.js'

/* -------------------------------------------------------------------------- */
/*                               PrivilegesSync                               */
/* -------------------------------------------------------------------------- */

export default class PrivilegesSync extends BaseCommand<typeof PrivilegesSync> {
  static override description =
    'Generate .sql migration files based on local schema changes without applying the migrations to the database.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  /* ----------------------------------- run ---------------------------------- */

  public async run(): Promise<void> {
    logger.debug('Running generate command')

    const res = await syncEngine.generateMigrationFile()

    if (res._metaType_ === 'NoChangesToApply') {
      return this.log(`No changes detected. No files were generated.`)
    }

    this.log('> Migration files were generated successfully!')
    this.log(`> Folder: ${this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PATH}/${res.fileName}`)
  }
}
