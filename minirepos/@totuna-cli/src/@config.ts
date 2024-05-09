import {PoolConfig, ClientConfig} from 'pg'
import * as crds from 'CRDs/@crds.js'
import * as crdParsers from 'CRDs/@crdParsers.js'
import {z} from 'zod'

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
        parsers: z.record(z.custom()),
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
        parsers: {
          TablePrivileges: crdParsers.CRDParser_TablePrivileges_TS,
          // ViewPrivileges: crdParsers.CRDParser_ViewPrivileges_YAML,
          // ColumnsPrivileges: crdParsers.CRDParser_ColumnsPrivileges_YAML,
          // SchemaPrivileges: crdParsers.CRDParser_SchemaPrivileges_YAML,
          // FunctionPrivileges: crdParsers.CRDParser_FunctionPrivileges_YAML,
          // SequencePrivileges: crdParsers.CRDParser_SequencePrivileges_YAML,
          // DatabasePrivileges: crdParsers.CRDParser_DatabasePrivileges_YAML,
          ...data.CRDs?.parsers,
        },
        crds: {
          TablePrivileges: crds.CRD_TablePrivilege,
          // ViewPrivileges: crds.CRD_ViewPrivilege,
          // ColumnsPrivileges: crds.CRD_ColumnsPrivilege,
          // SchemaPrivileges: crds.CRD_SchemaPrivilege,
          // FunctionPrivileges: crds.CRD_FunctionPrivilege,
          // SequencePrivileges: crds.CRD_SequencePrivilege,
          // DatabasePrivileges: crds.CRD_DatabasePrivilege,
          ...data.CRDs?.crds,
        },
      },
    }
  })

export type Config = Omit<z.infer<typeof Config>, 'CRDs'> & {
  CRDs?: {
    crds: Record<string, (typeof crds)[keyof typeof crds]>
    parsers: Record<string, (typeof crdParsers)[keyof typeof crdParsers]>
  }
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
