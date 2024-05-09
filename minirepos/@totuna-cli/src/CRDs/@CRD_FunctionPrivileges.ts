import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'
import {$fetchLocalStates} from './@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_FunctionPrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_FunctionPrivileges, typeof import('./@CRD_FunctionPrivileges.js')>()

type thisModule = ICRD_FunctionPrivileges

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type FunctionPrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'FunctionPrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z
  .object({
    kind: z.literal('FunctionPrivileges'),
    metadata: z.object({
      database: z.string(),
      schema: z.string(),
      function: z.string(),
    }),
    spec: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(z.literal('EXECUTE')),
      }),
    ),
  })
  .brand('CRD_FunctionPrivileges_StateSchema')

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
    const remoteSchema = remoteStateObjects.find(
      (remoteSchema) =>
        remoteSchema.metadata.schema === localSchema.metadata.schema &&
        remoteSchema.metadata.function === localSchema.metadata.function,
    )

    if (remoteSchema) {
      for (const remoteGrant of remoteSchema.spec) {
        const localGrant = localSchema.spec.find((localGrant) => localGrant.role === remoteGrant.role)

        for (const privilege of remoteGrant.privileges) {
          if (!localGrant?.privileges.includes(privilege)) {
            absentPrivilegesInLocalState.push({
              schema: localSchema.metadata.schema,
              role: remoteGrant.role,
              privilege,
            })
            res.push({
              _kind_: 'PlanInfo',
              localState: 'Absent',
              remoteState: 'Present',
              plan: `Revoke`,
              objectType: 'Function Privilege',
              objectPath: `${localSchema.metadata.schema}.${localSchema.metadata.function}`,
              oldState: `Granted ${privilege} TO ${remoteGrant.role}`,
              newState: `Revoked ${privilege} FROM ${remoteGrant.role}`,
              sqlQuery: `REVOKE ${privilege} ON FUNCTION ${localSchema.metadata.schema}.${localSchema.metadata.function} FROM "${remoteGrant.role}";`,
            })
          }
        }
      }
    }
  }

  /* ----------------- Find absent privileges in remote state ----------------- */
  for (const remoteSchema of remoteStateObjects) {
    const localSchema = localStateObjects.find(
      (localSchema) =>
        localSchema.metadata.schema === remoteSchema.metadata.schema &&
        localSchema.metadata.function === remoteSchema.metadata.function,
    )

    if (localSchema) {
      for (const localGrant of localSchema.spec) {
        const remoteGrant = remoteSchema.spec.find((remoteGrant) => remoteGrant.role === localGrant.role)

        for (const privilege of localGrant.privileges) {
          if (!remoteGrant?.privileges.includes(privilege)) {
            absentPrivilegesInRemoteState.push({
              schema: remoteSchema.metadata.schema,
              role: localGrant.role,
              privilege,
            })
            res.push({
              _kind_: 'PlanInfo',
              localState: 'Present',
              remoteState: 'Absent',
              plan: `Grant`,
              objectType: 'Function Privilege',
              objectPath: `${remoteSchema.metadata.schema}.${remoteSchema.metadata.function}`,
              oldState: `No ${privilege} TO ${localGrant.role}`,
              newState: `Granted ${privilege} TO ${localGrant.role}`,
              sqlQuery: `GRANT ${privilege} ON FUNCTION ${localSchema.metadata.schema}.${localSchema.metadata.function} TO "${localGrant.role}";`,
            })
          }
        }
      }
    }
  }

  return res
}

/* --------------------------- $fetchRemoteStates --------------------------- */
export const $fetchRemoteStates: thisModule['$fetchRemoteStates'] = async () => {
  const rootStore = await getRootStore()

  const {rows} = await rootStore.pgClient.query<{
    database: string
    schema: string
    grantee: string
    privilege: 'EXECUTE'
    function: string
  }>(`
  SELECT
  n.nspname AS schema,
  p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' AS function,
  current_database() AS database,
  CASE
      WHEN r.rolname IS NULL THEN 'PUBLIC'
      ELSE r.rolname
  END AS grantee,
  CASE
      WHEN a.privilege_type = 'EXECUTE' THEN 'EXECUTE'
  END AS privilege
FROM
  pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  LEFT JOIN aclexplode(p.proacl) a ON TRUE
  LEFT JOIN pg_roles r ON a.grantee = r.oid
WHERE
  (n.nspname NOT IN ('pg_catalog', 'information_schema'))
  AND (r.rolname NOT LIKE 'pg\_%' OR r.rolname IS NULL)
ORDER BY
  n.nspname,
  p.proname,
  grantee;
`)

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find(
      (state) => state.metadata.schema === row.schema && state.metadata.function === row.function,
    )

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'FunctionPrivileges',
        metadata: {database: row.database, schema: row.schema, function: row.function},
        spec: [],
      })
      stateObjects.push(stateObj)
    }

    // Find the role grants for the role
    const roleGrants = stateObj.spec.find((grant) => grant.role === row.grantee)

    // If not found, create a new role grant
    if (!roleGrants) {
      stateObj.spec.push({role: row.grantee, privileges: [row.privilege]})
    } else {
      roleGrants.privileges.push(row.privilege)
    }
  }

  return stateObjects
}

/* ------------------------ diffStateObjects ------------------------ */

export const diffStateObjects: thisModule['diffStateObjects'] = (stateA, stateB) => {
  const res = {
    uniqueToA: [],
    uniqueToB: [],
    common: [],
  } as ReturnType<thisModule['diffStateObjects']>

  for (const objA of stateA) {
    const objB = stateB.find(
      (obj) =>
        obj.kind === objA.kind &&
        obj.metadata.schema === objA.metadata.schema &&
        obj.metadata.database === objA.metadata.database &&
        obj.metadata.function === objA.metadata.function,
    )

    if (!objB) {
      res.uniqueToA.push(objA)
    } else {
      res.common.push(objA)
    }
  }

  for (const objB of stateB) {
    const objA = stateA.find(
      (obj) =>
        obj.kind === objB.kind &&
        obj.metadata.schema === objB.metadata.schema &&
        obj.metadata.database === objB.metadata.database &&
        obj.metadata.function === objB.metadata.function,
    )

    if (!objA) {
      res.uniqueToB.push(objB)
    }
  }

  return res
}
