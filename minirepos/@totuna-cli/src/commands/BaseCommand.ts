import {Config} from '@config.js'
import {logger} from 'utils/@utils.js'
import {getRootStore, initRootStore} from '@RootStore.js'

import {Command, Flags, Interfaces} from '@oclif/core'
import path from 'path'
import {glob} from 'glob'
import fs from 'fs'
import {parse} from 'yaml'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

/* -------------------------------------------------------------------------- */
/*                                 BaseCommand                                */
/* -------------------------------------------------------------------------- */

export abstract class BaseCommand<T extends typeof Command> extends Command {
  public static enableJsonFlag = true
  static baseFlags = {
    configFilePath: Flags.string({
      helpGroup: 'GLOBAL',
      summary: 'Specify the totuna config file path to use.',
    }),
    json: Flags.boolean({
      description: 'Output as JSON',
      default: false,
    }),
    silence: Flags.boolean({
      description: 'Silence the output',
      default: false,
    }),
  }

  protected args!: Args<T>
  protected flags!: Flags<T>

  rootStore!: Awaited<ReturnType<typeof getRootStore>>

  /* ---------------------------------- init ---------------------------------- */

  public async init(): Promise<void> {
    await this._parseFlagsAndArgs()
    logger.debug('Initializing cli')
    await super.init()
    this.rootStore = await this._initRootStore()

    process.on('SIGINT', () => {
      process.exit(130)
    })
  }

  protected async _parseFlagsAndArgs() {
    const {args, flags} = await this.parse({
      args: this.ctor.args,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      flags: this.ctor.flags,
      strict: this.ctor.strict,
    })
    this.args = args as Args<T>
    this.flags = flags as Flags<T>
  }

  /* ---------------------------------- catch --------------------------------- */

  public async catch(error: Error): Promise<void> {
    this.error(error)
  }

  /* --------------------------------- finally -------------------------------- */
  // PS: This is executed for EACH command when its ends
  public async finally(_: Error | undefined): Promise<any> {}

  /* ----------------------------- _initRootStore ----------------------------- */

  protected async _initRootStore() {
    try {
      logger.debug('Initializing totuna root store')
      let configFilePath = this.flags.configFilePath

      if (!configFilePath) {
        // If no custom config file path is specified, search for default config files
        const defaultConfigFiles = glob.sync('totuna.config.{json,ts,js,yaml,yml}', {cwd: process.cwd()})
        if (defaultConfigFiles.length > 0) {
          configFilePath = path.join(process.cwd(), defaultConfigFiles[0])
          logger.debug(`Found default config file: ${configFilePath}`)
        } else {
          throw new Error('No config file found')
        }
      }

      let config

      // Parse the config file based on its extension
      switch (path.extname(configFilePath)) {
        case '.json':
          config = JSON.parse(await fs.promises.readFile(configFilePath, 'utf-8'))
          break
        case '.ts':
        case '.js':
          config = (await import(configFilePath)).default
          break
        case '.yaml':
        case '.yml':
          const yamlContent = await fs.promises.readFile(configFilePath, 'utf-8')
          config = parse(yamlContent)
          break
        default:
          throw new Error(`Unsupported config file extension: ${path.extname(configFilePath)}`)
      }

      // const config = Config.parse(config);
      return await initRootStore(config)
    } catch (error) {
      throw new Error(`Something went wrong on initialization: ${error}`, {cause: error})
    }
  }
}
