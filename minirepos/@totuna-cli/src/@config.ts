import {PoolConfig, ClientConfig} from 'pg'
import {z} from 'zod'

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

export const Config = z.object({
  _kind_: z.literal('_Config_'),
  pgConfig: z.union([z.custom<PoolConfig>(), z.custom<ClientConfig>()]),
  cli: z.object({
    useTTY: z.boolean(),
  }),
})

export type Config = z.infer<typeof Config>

export const defineConfig = (config: Omit<Config, '_kind_' | '[BRAND]'>): Config => {
  if (!config.pgConfig) {
    throw new Error('Check your config file. Property "pgConfig" is required.')
  }

  return Config.parse({
    _kind_: '_Config_',
    ...config,
  })
}
