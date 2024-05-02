import {Args, Flags} from '@oclif/core'
import inquirer from 'inquirer'
import ora from 'ora'
import {BaseCommand} from '../../base.js'
import * as syncEngine from '@totuna/core/@privileges/@syncEngine'
import * as onTable from '@totuna/core/@privileges/@onTable'
import * as onFunction from '@totuna/core/@privileges/@onFunction'
import * as onView from '@totuna/core/@privileges/@onView'
import * as onColumn from '@totuna/core/@privileges/@onColumn'
import * as onSchema from '@totuna/core/@privileges/@onSchema'
import * as onDatabase from '@totuna/core/@privileges/@onDatabase'
import * as onSequence from '@totuna/core/@privileges/@onSequence'

import {logger} from '@log.js'

/* -------------------------------------------------------------------------- */
/*                                    Misc                                    */
/* -------------------------------------------------------------------------- */

const privileges = {
  onTable,
  onFunction,
  onView,
  onColumn,
  onSchema,
  onDatabase,
  onSequence,
}

const objectMapping: Record<string, keyof typeof privileges> = {
  table: 'onTable',
  function: 'onFunction',
  view: 'onView',
  column: 'onColumn',
  schema: 'onSchema',
  database: 'onDatabase',
  sequence: 'onSequence',
}

/* -------------------------------------------------------------------------- */
/*                               PrivilegesSync                               */
/* -------------------------------------------------------------------------- */

export default class PrivilegesSync extends BaseCommand<typeof PrivilegesSync> {
  static override args = {
    object: Args.string({
      description: 'The object to pull privileges from.',
      default: 'all',
      options: ['all', ...Object.keys(objectMapping)],
    }),
  }

  static override description = 'Push the current local privilege changes from .ts files to the PostgreSQL database.'
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
      await syncEngine.pullPrivilege(module)
    } else {
      await Promise.all(
        Object.values(objectMapping).map(async (object) => {
          const module = privileges[object]
          this.log(`Pulling privileges for ${object.slice(2)}s..`)
          await syncEngine.pullPrivilege(module)
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

    const {doPull} = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'doPull',
        prefix: '[\x1b[33mWARNING\x1b[37m] > \x1b[33m',
        message: 'This will override the local files. Are you sure you want to continue?',
      },
    ])

    const spinner = ora().start()

    if (!doPull) {
      spinner.fail('Operation was cancelled.')
      return
    }

    await Promise.all(
      _toPull.map(async (_object) => {
        const object = _object.slice(1).toLowerCase()
        const module = privileges[objectMapping[object.toLowerCase()]]
        spinner.start(`Pulling privileges for ${object.toLowerCase()}s..`)
        await syncEngine.pullPrivilege(module)
      }),
    )

    spinner.succeed('Privileges were pulled successfully!')
  }
}
