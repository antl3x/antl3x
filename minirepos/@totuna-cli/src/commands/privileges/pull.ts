import {Args, Flags} from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'
import {BaseCommand} from '../../base.js'
import * as atPrivilegesApi from '@totuna/core/privileges/@api'

import {logger} from '@log.js'
import {objectMapping, privileges} from './@utils.js'

/* -------------------------------------------------------------------------- */
/*                               PrivilegesSync                               */
/* -------------------------------------------------------------------------- */

export default class PrivilegesSync extends BaseCommand<typeof PrivilegesSync> {
  static aliases = ['p:pull', 'priv:pull']
  static override args = {
    object: Args.string({
      description: 'The object to pull privileges from.',
      default: 'all',
      options: ['all', ...Object.keys(objectMapping)],
    }),
  }

  static override description = 'Pull the current privilege states from PostgreSQL and generate .ts files.'
  static override examples = ['<%= config.bin %> <%= command.id %>']

  static override flags = {
    name: Flags.string({char: 'n', description: 'name to print'}),
  }

  /* ----------------------------------- run ---------------------------------- */

  public async run(): Promise<void> {
    if (process.stdin.isTTY && this.rootStore.userConfig.cli.useTTY) {
      await this._runTTY()
    } else {
      await this._runPipe()
    }
  }

  /* -------------------------------- _runPipe -------------------------------- */

  public async _runPipe(): Promise<void> {
    logger.debug('Running pull command')

    if (this.args.object !== 'all') {
      const module = privileges[objectMapping[this.args.object]]
      this.log(`Pulling privileges for ${this.args.object}s..`)
      await atPrivilegesApi.pullPrivilege(module, false)
    } else {
      await Promise.all(
        Object.values(objectMapping).map(async (object) => {
          const module = privileges[object]
          this.log(`Pulling privileges for ${object.slice(2)}s..`)
          await atPrivilegesApi.pullPrivilege(module, false)
        }),
      )
    }

    this.log('Privileges were pulled successfully!')
  }

  /* --------------------------------- _runTTY -------------------------------- */

  public async _runTTY(): Promise<void> {
    logger.debug('Running pull command')
    const {toPull} = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'toPull',
        message: 'Select the objects to pull privileges from:',
        choices: Object.keys(objectMapping).map((key) => ' ' + key.charAt(0).toUpperCase() + key.slice(1)),
      },
    ])

    const _toPull = toPull as string[]

    const spinner = ora().start()

    await Promise.all(
      _toPull.map(async (_object) => {
        const object = _object.slice(1).toLowerCase()
        const module = privileges[objectMapping[object.toLowerCase()]]
        spinner.start(`Pulling privileges for ${object.toLowerCase()}s..`)
        await atPrivilegesApi.pullPrivilege(module, false)
      }),
    )

    spinner.succeed('Privileges were pulled successfully!')
  }
}
