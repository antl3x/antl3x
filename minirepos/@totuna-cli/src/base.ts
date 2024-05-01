import {Command, Flags, Interfaces} from '@oclif/core'
import type {defineConfig} from '@totuna/core/@config'
import {getRootStore, initRootStore} from '@totuna/core/@rootStore'
import path from 'path'

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<(typeof BaseCommand)['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  totunaConfig!: ReturnType<typeof defineConfig>

  // define flags that can be inherited by any command that extends BaseCommand
  static baseFlags = {
    configFilePath: Flags.string({
      default: 'totuna.config.ts',
      helpGroup: 'GLOBAL',
      summary: 'Specify the totuna config file path to use.',
    }),
    'log-level': Flags.option({
      default: 'info',
      helpGroup: 'GLOBAL',
      options: ['debug', 'warn', 'error', 'info', 'trace'] as const,
      summary: 'Specify level for logging.',
    })(),
  }

  protected args!: Args<T>
  protected flags!: Flags<T>

  protected async catch(err: {exitCode?: number} & Error): Promise<unknown> {
    return super.catch(err)
  }

  protected async finally(_: Error | undefined): Promise<unknown> {
    ;(await getRootStore()).pgClient.end()
    return super.finally(_)
  }

  public async init(): Promise<void> {
    await super.init()

    const {args, flags} = await this.parse({
      args: this.ctor.args,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      flags: this.ctor.flags,
      strict: this.ctor.strict,
    })

    this.flags = flags as Flags<T>
    this.args = args as Args<T>
    await this._initRootStore()
  }

  protected async _initRootStore(): Promise<void> {
    try {
      const configFilePath = path.join(process.cwd(), this.flags.configFilePath)
      const config = (await import(configFilePath)).default as ReturnType<typeof defineConfig>
      await initRootStore(config)
    } catch (error) {
      this.error(`Error loading totuna config file: ${error}`)
    }
  }
}
