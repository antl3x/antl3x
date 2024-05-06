import {BaseCommand} from 'BaseCommand.js'

/* -------------------------------------------------------------------------- */
/*                               Command                               */
/* -------------------------------------------------------------------------- */

export default class Command extends BaseCommand<typeof Command> {
  public static enableJsonFlag = true
  static override description = 'Exports current database state to CRD files.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  public async init(): Promise<void> {
    await super.init()
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run() {
    try {
      this.log('Hello')
    } catch (error) {
      throw new Error(`Failed to export: ${error}`, {cause: error})
    }
  }
}
