import {Args, Flags} from '@oclif/core'
import {BaseCommand} from '../../base.js'
import {getRootStore} from '@totuna/core/@rootStore'
import * as syncEngine from '@totuna/core/@privileges/@syncEngine'
import * as onTable from '@totuna/core/@privileges/@onTable'

export default class PrivilegesSync extends BaseCommand<typeof PrivilegesSync> {
  static override args = {
    file: Args.file({description: 'file to pull'}),
  }

  static override description = 'Pull privileges from the database and override the local files.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(PrivilegesSync)
    const rootStore = await getRootStore()

    this.log(`Pulling`)
    syncEngine.pullPrivilege(onTable)
  }
}
