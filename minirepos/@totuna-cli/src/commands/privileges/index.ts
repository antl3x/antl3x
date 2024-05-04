import {BaseCommand} from 'base.js'

export class PrivilegesIndex extends BaseCommand<typeof PrivilegesIndex> {

  async run() {
    this.log('PrivilegesIndex')
  }

    static description = 'PrivilegesIndex'

    static examples = ['<%= config.bin %> <%= command.id %>']


}
