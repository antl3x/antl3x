import {PoolConfig, ClientConfig} from 'pg'
import {Optional} from 'utility-types'
import * as defaultCRDs from 'CRDs/@crds.js'
import * as crdParsers from 'CRDs/@crdParsers.js'
import {z} from 'zod'
import {IRCDParser} from 'CRDs/ICRDParser.js'
import {ICRD} from 'CRDs/ICRD.js'

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */
export const Config = z.object({
  _kind_: z.literal('_Config_'),
  pgConfig: z.union([z.custom<PoolConfig>(), z.custom<ClientConfig>()]),
  useFlatFolder: z.optional(z.boolean().default(false)),
  crdParser: z.optional(z.union([z.literal('yaml'), z.literal('typescript')])).default('typescript'),
  crdFolderStrategy: z
    .union([z.literal('totalFlat'), z.literal('flatByType'), z.literal('nestedByObjectPath')])
    .default('nestedByObjectPath'),
  tsOptions: z.optional(z.custom()),
})

export type Config = z.infer<typeof Config> & {
  tsOptions: {
    parser: IRCDParser
    crds: Record<string, ICRD>
  }
}

type ConfigParams = Optional<Omit<Config, '_kind_' | '[BRAND]'>, 'tsOptions' | 'crdFolderStrategy'>

export const defineConfig = (config: ConfigParams): Config => {
  if (!config.pgConfig) {
    throw new Error('Check your config file. Property "pgConfig" is required.')
  }

  return Config.parse({
    _kind_: '_Config_',
    ...config,
    tsOptions: {
      ...config.tsOptions,
      parser: config?.crdParser === 'typescript' ? crdParsers.TYPESCRIPT : crdParsers.YAML,
      crds: {
        ...defaultCRDs,
        ...config.tsOptions?.crds,
      },
    },
  }) as Config
}
