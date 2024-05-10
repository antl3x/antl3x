import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_TablePrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_TablePrivileges, typeof import('./@CRD_TablePrivileges.js')>()

type thisModule = ICRD_TablePrivileges

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type TablePrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'TablePrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  kind: z.literal('TablePrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    table: z.string(),
    privileges: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(
          z.union([
            z.literal('SELECT'),
            z.literal('INSERT'),
            z.literal('UPDATE'),
            z.literal('DELETE'),
            z.literal('TRUNCATE'),
            z.literal('REFERENCES'),
            z.literal('TRIGGER'),
            z.literal('ALL'),
          ]),
        ),
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
        remoteSchema.spec.table === localSchema.spec.table,
    )

    if (remoteSchema) {
      for (const remoteGrant of remoteSchema.spec.privileges) {
        const localGrant = localSchema.spec.privileges.find((localGrant) => localGrant.role === remoteGrant.role)

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
              objectType: 'Table Privilege',
              objectPath: `${localSchema.spec.schema}.${localSchema.spec.table}`,
              oldState: `Granted ${privilege} TO ${remoteGrant.role}`,
              newState: `Revoked ${privilege} FROM ${remoteGrant.role}`,
              sqlQuery: `REVOKE ${privilege} ON TABLE ${localSchema.spec.schema}."${localSchema.spec.table}" FROM "${remoteGrant.role}";`,
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
        localSchema.spec.table === remoteSchema.spec.table,
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
              objectType: 'Table Privilege',
              objectPath: `${remoteSchema.spec.schema}.${remoteSchema.spec.table}`,
              oldState: `No ${privilege} TO ${localGrant.role}`,
              newState: `Granted ${privilege} TO ${localGrant.role}`,
              sqlQuery: `GRANT ${privilege} ON TABLE ${localSchema.spec.schema}."${localSchema.spec.table}" TO "${localGrant.role}";`,
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
    privilege: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'TRUNCATE' | 'REFERENCES' | 'TRIGGER'
    table: string
  }>(`
  SELECT
  n.nspname AS schema,
  c.relname AS table,
  current_database() AS database,
  COALESCE(r.rolname, 'PUBLIC') AS grantee,
  COALESCE(a.privilege_type, '__NO_PRIVILEGES__') AS privilege
FROM
  pg_class c
JOIN
  pg_namespace n ON c.relnamespace = n.oid
LEFT JOIN
  aclexplode(c.relacl) a ON TRUE
LEFT JOIN
  pg_roles r ON a.grantee = r.oid
WHERE
  c.relkind = 'r' -- 'r' stands for regular tables
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
  AND (r.rolname IS NULL OR r.rolname NOT LIKE 'pg\_%')
ORDER BY
  n.nspname, c.relname, grantee;

`)

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find(
      (state) =>
        state.spec.database === row.database && state.spec.schema === row.schema && state.spec.table === row.table,
    )

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'TablePrivileges',
        metadata: {
          name: `${row.database}.${row.schema}.${row.table}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          table: row.table,
          privileges: [],
        },
      } as TablePrivileges)
      stateObjects.push(stateObj)
    }

    // Find the role grants for the role
    const roleGrants = stateObj.spec.privileges.find((grant) => grant.role === row.grantee)

    // If not found, create a new role grant
    if (!roleGrants) {
      stateObj.spec.privileges.push({
        role: row.grantee,
        privileges: (row.privilege as string) !== '__NO_PRIVILEGES__' ? [row.privilege] : [],
      })
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
        obj.spec.table === objA.spec.table,
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
        obj.spec.table === objB.spec.table,
    )

    if (!objA) {
      res.uniqueToB.push(objB)
    }
  }

  return res
}
