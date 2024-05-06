import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {satisfies} from 'utils/@utils.js'
import {getRootStore} from '@RootStore.js'
import * as jdp from 'jsondiffpatch'
import * as glob from 'glob'
import fs from 'node:fs'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_SchemaPrivilege extends ICRD<typeof StateSchema> {}

satisfies<ICRD_SchemaPrivilege, typeof import('./@CRD_SchemaPrivileges.js')>()

type thisModule = ICRD_SchemaPrivilege

type StateObject = z.TypeOf<thisModule['StateSchema']>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'SchemaPrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z
  .object({
    kind: z.literal('SchemaPrivileges'),
    metadata: z.object({
      name: z.string(),
    }),
    spec: z.object({
      database: z.string(),
      schema: z.string(),
      rolePrivileges: z.record(z.array(z.union([z.literal('USAGE'), z.literal('CREATE')]))),
    }),
  })
  .brand('CRD_SchemaPrivilege_StateSchema')

export const StateDiff = z.object({
  name: z.string(),
  privileges: z.array(z.string()),
})

/* --------------------------------- compare -------------------------------- */

export const $compare: thisModule['$compare'] = async (parser) => {
  const localStateObjects = await $fetchLocalStates(parser)
  const remoteStateObjects = await $fetchRemoteStates()

  const operations: {
    operation: 'GRANT' | 'REVOKE'
    role: string
    privilege: 'USAGE' | 'CREATE'
  }[] = []

  const delta = jdp.diff(remoteStateObjects, localStateObjects)

  for (const diffKey in delta) {
    const rolesPrivilegesChanges =
      delta.hasOwnProperty(diffKey) && delta[diffKey].spec && delta[diffKey].spec.rolePrivileges

    if (rolesPrivilegesChanges) {
      for (const role in rolesPrivilegesChanges) {
        const privilegesDelta = rolesPrivilegesChanges[role]

        console.log(privilegesDelta)

        for (const privDelta in privilegesDelta) {
          if (privDelta == '_t') continue

          const [privilegeValue, privilegeNewValue, isDeletion] = privilegesDelta[privDelta]

          if (isDeletion === 0) {
            operations.push({
              operation: 'REVOKE',
              role,
              privilege: privilegeValue,
            })
          }

          if (privilegeValue && privilegesDelta[privDelta].length === 2) {
            operations.push({
              operation: 'REVOKE',
              role,
              privilege: privilegeValue,
            })
            operations.push({
              operation: 'GRANT',
              role,
              privilege: privilegeNewValue,
            })
          }

          if (privilegeValue && privilegesDelta[privDelta].length === 1) {
            operations.push({
              operation: 'GRANT',
              role,
              privilege: privilegeValue,
            })
          }
        }
      }
    }
  }

  console.log(operations)
}

/* ---------------------------------- plan ---------------------------------- */

export const plan: thisModule['plan'] = (state) => {
  return `CREATE SCHEMA ${state.kind}`
}

/* -------------------------------- validate -------------------------------- */

export const validate: thisModule['validate'] = (state) => {
  return true
}

/* --------------------------------- $apply --------------------------------- */

export const $apply: thisModule['$apply'] = (state) => {
  return {_kind_: 'AppliedWithSuccess'}
}

/* ---------------------------------- $plan --------------------------------- */

export const $plan: thisModule['$plan'] = (state) => {
  return {_kind_: 'PlanInfo'}
}

/* ---------------------------------- $pull --------------------------------- */

export const $pull: thisModule['$pull'] = async () => {
  return $fetchRemoteStates()
}

/* ---------------------------- $fetchLocalStates --------------------------- */

export const $fetchLocalStates: thisModule['$fetchLocalStates'] = async (parser) => {
  // Fetch all .yaml files in the directory
  // Then check if the file is a valid SchemaPrivilege file
  // If not, log and skip
  // If valid, parse and return
  const rootStore = await getRootStore()
  const files = glob.sync(rootStore.systemVariables.PUBLIC_CRD_SCHEMA_PRIVILEGES_PATH(`*/*.${parser.FILE_EXTENSION}`))
  const validFiles: StateObject[] = []

  for (const file of files) {
    if (!file.endsWith(parser.FILE_EXTENSION)) {
      continue
    }

    const state = parser.parseFileToStateObject(fs.readFileSync(file, 'utf8'))

    if (state.kind !== 'SchemaPrivileges') {
      continue
    }
    validFiles.push(state)
  }

  return validFiles
}

/* --------------------------- $fetchRemoteStates --------------------------- */
export const $fetchRemoteStates: thisModule['$fetchRemoteStates'] = async () => {
  const rootStore = await getRootStore()

  const {rows} = await rootStore.pgClient.query<{
    database: string
    schema: string
    grantee: string
    privilege: 'USAGE' | 'CREATE'
  }>(`
  SELECT current_database() AS database, r.rolname AS grantee,
  n.nspname AS schema,
  p.perm AS privilege
FROM pg_catalog.pg_namespace AS n
CROSS JOIN pg_catalog.pg_roles AS r
CROSS JOIN (VALUES ('USAGE'), ('CREATE')) AS p(perm)
WHERE has_schema_privilege(r.oid, n.oid, p.perm)
 AND n.nspname <> 'information_schema'
 AND n.nspname not LIKE 'pg_%'
 AND r.rolname not LIKE 'pg_%'
--      AND NOT r.rolsuper`)

  const schemas = rows.reduce((acc, row) => {
    acc[row.schema] = acc[row.schema] || []
    acc[row.schema].push(row)
    return acc
  }, {} as Record<string, typeof rows>)

  const stateSchemas = Object.entries(schemas).map(([schema, rows]) => {
    return StateSchema.parse({
      kind: 'SchemaPrivileges',
      metadata: {
        name: `${rows[0].database}_${schema}_privileges`,
      },
      spec: {
        database: rows[0].database,
        schema,
        rolePrivileges: rows.reduce((acc, row) => {
          acc[row.grantee] = acc[row.grantee] || []
          acc[row.grantee].push(row.privilege)
          return acc
        }, {} as z.TypeOf<typeof StateSchema>['spec']['rolePrivileges']),
      },
    } as z.TypeOf<typeof StateSchema>)
  })

  return stateSchemas
}
