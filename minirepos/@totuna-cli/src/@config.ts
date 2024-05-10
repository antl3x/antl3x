import {PoolConfig, ClientConfig} from 'pg'
import * as crds from 'CRDs/@crds.js'
import * as crdParsers from 'CRDs/@crdParsers.js'
import {z} from 'zod'
import {IRCDParser} from 'CRDs/ICRDParser.js'

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

export const Config = z
  .object({
    _kind_: z.literal('_Config_'),
    pgConfig: z.union([z.custom<PoolConfig>(), z.custom<ClientConfig>()]),
    useFlatFolder: z.optional(z.boolean().default(false)),
    CRDs: z
      .object({
        crds: z.record(z.custom()),
        parser: z.union([z.literal('typescript'), z.literal('yaml'), z.custom<IRCDParser>()]).default('typescript'),
      })
      .optional(),
    cli: z.object({
      useTTY: z.boolean(),
    }),
  })
  .transform((data) => {
    return {
      ...data,
      CRDs: {
        parser:
          typeof data.CRDs?.parser === 'string'
            ? crdParsers[data.CRDs.parser.toUpperCase() as keyof typeof crdParsers]
            : data.CRDs?.parser,
        crds: {
          TablePrivileges: crds.CRD_TablePrivilege,
          ViewPrivileges: crds.CRD_ViewPrivilege,
          ColumnsPrivileges: crds.CRD_ColumnsPrivilege,
          SchemaPrivileges: crds.CRD_SchemaPrivilege,
          FunctionPrivileges: crds.CRD_FunctionPrivilege,
          SequencePrivileges: crds.CRD_SequencePrivilege,
          DatabasePrivileges: crds.CRD_DatabasePrivilege,
          ...data.CRDs?.crds,
        },
      },
    }
  })

export type Config = Omit<z.infer<typeof Config>, 'CRDs'> & {
  CRDs?: z.infer<typeof Config>['CRDs']
}

export const defineConfig = (config: Omit<Config, '_kind_' | '[BRAND]'>): Config => {
  if (!config.pgConfig) {
    throw new Error('Check your config file. Property "pgConfig" is required.')
  }

  return Config.parse({
    _kind_: '_Config_',
    ...config,
  })
}
