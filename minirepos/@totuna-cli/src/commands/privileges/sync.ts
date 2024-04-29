import {Args, Flags} from '@oclif/core'
import {BaseCommand} from '../../base.js'

export default class PrivilegesSync extends BaseCommand<typeof PrivilegesSync> {
  static override args = {
    file: Args.string({description: 'file to read'}),
  }

  static override description = 'describe the command here'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    force: Flags.boolean({char: 'f'}),
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(PrivilegesSync)

    this.log(`${this.totunaConfig.schemaName}`)
  }
}
