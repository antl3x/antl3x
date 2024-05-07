import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {satisfies} from 'utils/@utils.js'
import {getRootStore} from '@RootStore.js'
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
      grants: z.array(
        z.object({
          role: z.string(),
          privileges: z.array(z.union([z.literal('USAGE'), z.literal('CREATE')])),
        }),
      ),
    }),
  })
  .brand('CRD_SchemaPrivilege_StateSchema')

export const StateDiff = z.object({
  name: z.string(),
  privileges: z.array(z.string()),
})

/* --------------------------------- getPreviewPlan -------------------------------- */

export const $getPreviewPlan: thisModule['$getPreviewPlan'] = async (parser) => {
  const res: Awaited<ReturnType<thisModule['$getPreviewPlan']>> = []
  const localStateObjects = await $fetchLocalStates(parser)
  const remoteStateObjects = await $fetchRemoteStates()

  const absentPrivilegesInLocalState = []
  const absentPrivilegesInRemoteState = []

  /* ------------------ Find absent privileges in local state ----------------- */

  for (const localSchema of localStateObjects) {
    const remoteSchema = remoteStateObjects.find((remoteSchema) => remoteSchema.spec.schema === localSchema.spec.schema)

    if (remoteSchema) {
      for (const remoteGrant of remoteSchema.spec.grants) {
        const localGrant = localSchema.spec.grants.find((localGrant) => localGrant.role === remoteGrant.role)

        for (const privilege of remoteGrant.privileges) {
          if (!localGrant?.privileges.includes(privilege)) {
            absentPrivilegesInLocalState.push({
              schema: localSchema.spec.schema,
              role: remoteGrant.role,
              privilege,
            })
            res.push({
              _kind_: 'PlanInfo',
              localState: 'Absent',
              remoteState: 'Present',
              plan: `Revoke`,
              objectType: 'Schema Privilege',
              objectPath: `${localSchema.spec.database}.${localSchema.spec.schema}`,
              oldState: `Granted ${privilege} TO ${remoteGrant.role}`,
              newState: `Revoked ${privilege} FROM ${remoteGrant.role}`,
              sqlQuery: `REVOKE ${privilege} ON SCHEMA "${localSchema.spec.schema}" FROM "${remoteGrant.role}";`,
            })
          }
        }
      }
    }
  }

  /* ----------------- Find absent privileges in remote state ----------------- */
  for (const remoteSchema of remoteStateObjects) {
    const localSchema = localStateObjects.find((localSchema) => localSchema.spec.schema === remoteSchema.spec.schema)

    if (localSchema) {
      for (const localGrant of localSchema.spec.grants) {
        const remoteGrant = remoteSchema.spec.grants.find((remoteGrant) => remoteGrant.role === localGrant.role)

        for (const privilege of localGrant.privileges) {
          if (!remoteGrant?.privileges.includes(privilege)) {
            absentPrivilegesInRemoteState.push({
              schema: remoteSchema.spec.schema,
              role: localGrant.role,
              privilege,
            })
            res.push({
              _kind_: 'PlanInfo',
              localState: 'Present',
              remoteState: 'Absent',
              plan: `Grant`,
              objectType: 'Schema Privilege',
              objectPath: `${remoteSchema.spec.database}.${remoteSchema.spec.schema}`,
              oldState: `No ${privilege} TO ${localGrant.role}`,
              newState: `Granted ${privilege} TO ${localGrant.role}`,
              sqlQuery: `GRANT ${privilege} ON SCHEMA "${remoteSchema.spec.schema}" TO "${localGrant.role}";`,
            })
          }
        }
      }
    }
  }

  return res
}

/* ---------------------------- $fetchLocalStates --------------------------- */

export const $fetchLocalStates: thisModule['$fetchLocalStates'] = async (parser) => {
  // Fetch all .yaml files in the directory
  // Then check if the file is a valid SchemaPrivilege file
  // If not, log and skip
  // If valid, parse and return
  const rootStore = await getRootStore()
  const globPath = rootStore.userConfig.useFlatFolder
    ? `${rootStore.systemVariables.PUBLIC_DATABASE_PATH}/**/*.${parser.FILE_EXTENSION}`
    : rootStore.systemVariables.PUBLIC_CRD_SCHEMA_PRIVILEGES_PATH(`*/*.${parser.FILE_EXTENSION}`)
  const files = glob.sync(globPath)
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

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find((state) => state.spec.schema === row.schema)

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'SchemaPrivileges',
        metadata: {name: row.schema},
        spec: {database: row.database, schema: row.schema, grants: []},
      })
      stateObjects.push(stateObj)
    }

    // Find the role grants for the role
    const roleGrants = stateObj.spec.grants.find((grant) => grant.role === row.grantee)

    // If not found, create a new role grant
    if (!roleGrants) {
      stateObj.spec.grants.push({role: row.grantee, privileges: [row.privilege]})
    } else {
      roleGrants.privileges.push(row.privilege)
    }
  }

  return stateObjects
}
