import {logger} from '@log.js'
import {Command, Flags, Interfaces} from '@oclif/core'
import type {defineConfig} from '@totuna/core/@config'
import {getRootStore, initRootStore} from '@totuna/core/@rootStore'
import path from 'path'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

/* -------------------------------------------------------------------------- */
/*                                 BaseCommand                                */
/* -------------------------------------------------------------------------- */

export abstract class BaseCommand<T extends typeof Command> extends Command {
  static baseFlags = {
    configFilePath: Flags.string({
      default: 'totuna.config.ts',
      helpGroup: 'GLOBAL',
      summary: 'Specify the totuna config file path to use.',
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

  public async finally(_: Error | undefined): Promise<any> {
    // We end the pgClient connection if it exists
    if (this.rootStore?.pgClient) {
      await this.rootStore.pgClient.end()
    }
  }

  /* ----------------------------- _initRootStore ----------------------------- */

  protected async _initRootStore() {
    logger.debug('Initializing totuna root store')
    const configFilePath = path.join(process.cwd(), this.flags.configFilePath)
    const config = (await import(configFilePath)).default as ReturnType<typeof defineConfig>
    return await initRootStore(config)
  }
}
