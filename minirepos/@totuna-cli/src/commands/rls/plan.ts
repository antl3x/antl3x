import * as api from '@totuna/core/rls/@api'
import {BaseCommand} from '../../base.js'

import {logger} from '@log.js'

/* -------------------------------------------------------------------------- */
/*                               RLSPlan                               */
/* -------------------------------------------------------------------------- */

export default class RLSPlan extends BaseCommand<typeof RLSPlan> {
  static aliases = ['p:plan', 'priv:plan']
  static override description = 'Generate planned .sql migration files based on local schema changes.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  /* ----------------------------------- run ---------------------------------- */

  public async run(): Promise<void> {
    logger.debug('Running generate command')

    const res = await api.()

    if (res._metaType_ === 'NoMigrationPlan') {
      return this.log(`No changes detected. No mogration plan files were generated.`)
    }

    this.log('> Migration plan files were generated successfully! 🎉')
    this.log(`> Folder: ${this.rootStore.systemVariables.PUBLIC_MIGRATIONS_PLAN_PATH}/${res.fileName}`)
  }
}
