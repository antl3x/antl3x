import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_ColumnsPrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_ColumnsPrivileges, typeof import('./@CRD_ColumnsPrivileges.js')>()

type thisModule = ICRD_ColumnsPrivileges

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type ColumnsPrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'ColumnsPrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  kind: z.literal('ColumnsPrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    table: z.string(),
    privileges: z.array(
      z.object({
        column: z.string(),
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

  for (const localSchema of localStateObjects) {
    const remoteSchema = remoteStateObjects.find(
      (remote) =>
        remote.spec.database === localSchema.spec.database &&
        remote.spec.schema === localSchema.spec.schema &&
        remote.spec.table === localSchema.spec.table,
    )

    if (remoteSchema) {
      for (const localColumn of localSchema.spec.privileges) {
        const remoteColumn = remoteSchema.spec.privileges.find((rc) => rc.column === localColumn.column)

        if (remoteColumn) {
          // Handle existing roles in local state
          localColumn.privileges.forEach((localRole) => {
            const remoteRole = remoteColumn.privileges.find((rr) => rr.role === localRole.role)
            if (!remoteRole) {
              // Role is absent in remote state, add all local privileges to grant
              localRole.privileges.forEach((privilege) => {
                res.push(createPlan('Grant', localSchema, localColumn, localRole, privilege))
              })
            } else {
              // Compare privileges between local and remote for existing roles
              localRole.privileges.forEach((privilege) => {
                if (!remoteRole.privileges.includes(privilege)) {
                  res.push(createPlan('Grant', localSchema, localColumn, localRole, privilege))
                }
              })
              remoteRole.privileges.forEach((privilege) => {
                if (!localRole.privileges.includes(privilege)) {
                  res.push(createPlan('Revoke', remoteSchema, remoteColumn, remoteRole, privilege))
                }
              })
            }
          })

          // Handle roles present in remote but absent in local
          remoteColumn.privileges.forEach((remoteRole) => {
            if (!localColumn.privileges.some((lr) => lr.role === remoteRole.role)) {
              // Role is absent in local state, revoke all remote privileges
              remoteRole.privileges.forEach((privilege) => {
                res.push(createPlan('Revoke', remoteSchema, remoteColumn, remoteRole, privilege))
              })
            }
          })
        }
      }
    }
  }

  return res
}

function createPlan(
  action: 'Grant' | 'Revoke',
  schema: StateObject,
  column: StateObject['spec']['privileges'][0],
  role: StateObject['spec']['privileges'][0]['privileges'][0],
  privilege: string,
) {
  return {
    _kind_: 'PlanInfo' as const,
    localState: action === 'Grant' ? ('Present' as const) : ('Absent' as const),
    remoteState: action === 'Grant' ? ('Absent' as const) : ('Present' as const),
    plan: action,
    objectType: 'Table Privilege',
    objectPath: `${schema.spec.schema}.${schema.spec.table}.${column.column}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role.role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role.role}`,
    sqlQuery: `${action} ${privilege} ON TABLE ${schema.spec.schema}."${schema.spec.table}" TO "${role.role}";`,
  }
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
    column: string
  }>(`
  SELECT
  cp.table_schema AS schema,
  cp.table_name AS table,
  cp.column_name as column,
  current_database() AS database,
  COALESCE(cp.grantee, 'PUBLIC') AS grantee,
  cp.privilege_type AS privilege
FROM
  information_schema.column_privileges cp
WHERE
  cp.table_schema NOT IN ('pg_catalog', 'information_schema')
  AND (cp.grantee = 'PUBLIC' OR cp.grantee NOT LIKE 'pg\_%')
ORDER BY
  cp.table_schema, cp.table_name, cp.column_name, cp.grantee;

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
        kind: 'ColumnsPrivileges',
        metadata: {
          name: `${row.database}.${row.schema}.${row.table}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          table: row.table,
          privileges: [],
        },
      } as ColumnsPrivileges)
      stateObjects.push(stateObj)
    }

    // Find the column object in the spec array
    let columnObj = stateObj.spec.privileges.find((column) => column.column === row.column)

    // If not found, create a new column object
    if (!columnObj) {
      columnObj = {column: row.column, privileges: []}
      stateObj.spec.privileges.push(columnObj)
    }

    // Find the role grant object in the privileges array
    let roleGrantObj = columnObj.privileges.find((grant) => grant.role === row.grantee)

    // If not found, create a new role grant object
    if (!roleGrantObj) {
      roleGrantObj = {role: row.grantee, privileges: []}
      columnObj.privileges.push(roleGrantObj)
    }

    // Add the privilege to the role grant object
    roleGrantObj.privileges.push(row.privilege)
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