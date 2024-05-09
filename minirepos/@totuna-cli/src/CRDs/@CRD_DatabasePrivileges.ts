import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'
import {$fetchLocalStates} from './@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_DatabasePrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_DatabasePrivileges, typeof import('./@CRD_DatabasePrivileges.js')>()

type thisModule = ICRD_DatabasePrivileges

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type DatabasePrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'DatabasePrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z
  .object({
    kind: z.literal('DatabasePrivileges'),
    metadata: z.object({
      database: z.string(),
    }),
    spec: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(z.union([z.literal('CREATE'), z.literal('CONNECT'), z.literal('TEMPORARY')])),
      }),
    ),
  })
  .brand('CRD_DatabasePrivileges_StateSchema')

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
      (remoteSchema) => remoteSchema.metadata.database === localSchema.metadata.database,
    )

    if (remoteSchema) {
      for (const remoteGrant of remoteSchema.spec) {
        const localGrant = localSchema.spec.find((localGrant) => localGrant.role === remoteGrant.role)

        for (const privilege of remoteGrant.privileges) {
          if (!localGrant?.privileges.includes(privilege)) {
            absentPrivilegesInLocalState.push({
              role: remoteGrant.role,
              privilege,
            })
            res.push({
              _kind_: 'PlanInfo',
              localState: 'Absent',
              remoteState: 'Present',
              plan: `Revoke`,
              objectType: 'Database Privilege',
              objectPath: `${localSchema.metadata.database}`,
              oldState: `Granted ${privilege} TO ${remoteGrant.role}`,
              newState: `Revoked ${privilege} FROM ${remoteGrant.role}`,
              sqlQuery: `REVOKE ${privilege} ON DATABASE ${localSchema.metadata.database} FROM "${remoteGrant.role}";`,
            })
          }
        }
      }
    }
  }

  /* ----------------- Find absent privileges in remote state ----------------- */
  for (const remoteSchema of remoteStateObjects) {
    const localSchema = localStateObjects.find(
      (localSchema) => localSchema.metadata.database === remoteSchema.metadata.database,
    )

    if (localSchema) {
      for (const localGrant of localSchema.spec) {
        const remoteGrant = remoteSchema.spec.find((remoteGrant) => remoteGrant.role === localGrant.role)

        for (const privilege of localGrant.privileges) {
          if (!remoteGrant?.privileges.includes(privilege)) {
            absentPrivilegesInRemoteState.push({
              role: localGrant.role,
              privilege,
            })
            res.push({
              _kind_: 'PlanInfo',
              localState: 'Present',
              remoteState: 'Absent',
              plan: `Grant`,
              objectType: 'Database Privilege',
              objectPath: `${remoteSchema.metadata.database}`,
              oldState: `No ${privilege} TO ${localGrant.role}`,
              newState: `Granted ${privilege} TO ${localGrant.role}`,
              sqlQuery: `GRANT ${privilege} ON DATABASE ${localSchema.metadata.database} TO "${localGrant.role}";`,
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
    grantee: string
    privilege: 'CREATE' | 'CONNECT' | 'TEMPORARY'
  }>(`
  SELECT
    d.datname AS database,
    CASE
        WHEN r.rolname IS NULL THEN 'public'
        ELSE r.rolname
    END AS grantee,
    CASE
        WHEN a.privilege_type = 'CREATE' THEN 'CREATE'
        WHEN a.privilege_type = 'CONNECT' THEN 'CONNECT'
        WHEN a.privilege_type = 'TEMPORARY' THEN 'TEMPORARY'
        WHEN a.privilege_type = 'TEMP' THEN 'TEMPORARY'
    END AS privilege
FROM
    pg_database d
    LEFT JOIN aclexplode(d.datacl) a ON TRUE
    LEFT JOIN pg_roles r ON a.grantee = r.oid
WHERE
    (r.rolname NOT LIKE 'pg\_%') and 
    d.datistemplate = false 
ORDER BY
    database,
    grantee;
`)

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find((state) => state.metadata.database === row.database)

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'DatabasePrivileges',
        metadata: {database: row.database},
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
    const objB = stateB.find((obj) => obj.kind === objA.kind && obj.metadata.database === objA.metadata.database)

    if (!objB) {
      res.uniqueToA.push(objA)
    } else {
      res.common.push(objA)
    }
  }

  for (const objB of stateB) {
    const objA = stateA.find((obj) => obj.kind === objB.kind && obj.metadata.database === objB.metadata.database)

    if (!objA) {
      res.uniqueToB.push(objB)
    }
  }

  return res
}
