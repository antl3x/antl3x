import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_SequencePrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_SequencePrivileges, typeof import('./@CRD_SequencePrivileges.js')>()

type thisModule = ICRD_SequencePrivileges

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type SequencePrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'SequencePrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  kind: z.literal('SequencePrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    sequence: z.string(),
    privileges: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(z.union([z.literal('USAGE'), z.literal('SELECT'), z.literal('UPDATE')])),
      }),
    ),
  }),
})

export const StateDiff = z.object({
  name: z.string(),
  privileges: z.array(z.string()),
})

/* --------------------------------- getPreviewPlan -------------------------------- */

export const $getPreviewPlan: thisModule['$getPreviewPlan'] = async (localStateObjects) => {
  const res: Awaited<ReturnType<thisModule['$getPreviewPlan']>> = []
  const remoteStateObjects = await $fetchRemoteStates()

  const absentPrivilegesInLocalState = []
  const absentPrivilegesInRemoteState = []

  /* ------------------ Find absent privileges in local state ----------------- */

  for (const localSchema of localStateObjects) {
    const remoteSchema = remoteStateObjects.find(
      (remoteSchema) =>
        remoteSchema.spec.database === localSchema.spec.database &&
        remoteSchema.spec.schema === localSchema.spec.schema &&
        remoteSchema.spec.sequence === localSchema.spec.sequence,
    )

    if (remoteSchema) {
      for (const remoteGrant of remoteSchema.spec.privileges) {
        const localGrant = localSchema.spec.privileges.find((localGrant) => localGrant.role === remoteGrant.role)

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
              objectType: 'Sequence Privilege',
              objectPath: `${localSchema.spec.sequence}`,
              oldState: `Granted ${privilege} TO ${remoteGrant.role}`,
              newState: `Revoked ${privilege} FROM ${remoteGrant.role}`,
              sqlQuery: `REVOKE ${privilege} ON SEQUENCE ${localSchema.spec.schema}."${localSchema.spec.sequence}" FROM "${remoteGrant.role}";`,
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
        localSchema.spec.database === remoteSchema.spec.database &&
        localSchema.spec.schema === remoteSchema.spec.schema &&
        localSchema.spec.sequence === remoteSchema.spec.sequence,
    )

    if (localSchema) {
      for (const localGrant of localSchema.spec.privileges) {
        const remoteGrant = remoteSchema.spec.privileges.find((remoteGrant) => remoteGrant.role === localGrant.role)

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
              objectType: 'Sequence Privilege',
              objectPath: `${remoteSchema.spec.schema}.${remoteSchema.spec.sequence}`,
              oldState: `No ${privilege} TO ${localGrant.role}`,
              newState: `Granted ${privilege} TO ${localGrant.role}`,
              sqlQuery: `GRANT ${privilege} ON SEQUENCE ${localSchema.spec.schema}."${localSchema.spec.sequence}" TO "${localGrant.role}";`,
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
    privilege: 'USAGE' | 'SELECT' | 'UPDATE'
    sequence: string
  }>(`
  select
    current_database() as database, 
    n.nspname AS schema,
    c.relname AS sequence,
    CASE
        WHEN r.rolname IS NULL THEN 'PUBLIC'
        ELSE r.rolname
    END AS grantee,
    CASE
        WHEN a.privilege_type = 'USAGE' THEN 'USAGE'
        WHEN a.privilege_type = 'SELECT' THEN 'SELECT'
        WHEN a.privilege_type = 'UPDATE' THEN 'UPDATE'
        else a.privilege_type
    END AS privilege
FROM
    pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN aclexplode(c.relacl) a ON TRUE
    LEFT JOIN pg_roles r ON a.grantee = r.oid
WHERE
    c.relkind = 'S'
    AND (n.nspname NOT IN ('pg_catalog', 'information_schema'))
    AND (r.rolname NOT LIKE 'pg\_%' OR r.rolname IS NULL)
    and a.privilege_type is not null
ORDER BY
    schema,
    sequence,
    grantee;
`)

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find(
      (state) => state.spec.schema === row.schema && state.spec.sequence === row.sequence,
    )

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'SequencePrivileges',
        metadata: {
          name: `${row.database}.${row.schema}.${row.sequence}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          sequence: row.sequence,
          privileges: [],
        },
      } as SequencePrivileges)
      stateObjects.push(stateObj)
    }

    // Find the role grants for the role
    const roleGrants = stateObj.spec.privileges.find((grant) => grant.role === row.grantee)

    // If not found, create a new role grant
    if (!roleGrants) {
      stateObj.spec.privileges.push({role: row.grantee, privileges: [row.privilege]})
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
        obj.spec.schema === objA.spec.schema &&
        obj.spec.database === objA.spec.database &&
        obj.spec.sequence === objA.spec.sequence,
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
        obj.spec.schema === objB.spec.schema &&
        obj.spec.database === objB.spec.database &&
        obj.spec.sequence === objB.spec.sequence,
    )

    if (!objA) {
      res.uniqueToB.push(objB)
    }
  }

  return res
}
