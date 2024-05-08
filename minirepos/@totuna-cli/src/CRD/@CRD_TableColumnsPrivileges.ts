import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'
import {$fetchLocalStates} from './@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_TableColumnsPrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_TableColumnsPrivileges, typeof import('./@CRD_TableColumnsPrivileges.js')>()

type thisModule = ICRD_TableColumnsPrivileges

type StateObject = z.TypeOf<thisModule['StateSchema']>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'TableColumnsPrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z
  .object({
    kind: z.literal('TableColumnsPrivileges'),
    metadata: z.object({
      database: z.string(),
      schema: z.string(),
      table: z.string(),
    }),
    spec: z.array(
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
  })
  .brand('CRD_TableColumnsPrivileges_StateSchema')

export const StateDiff = z.object({
  name: z.string(),
  privileges: z.array(z.string()),
})

/* --------------------------------- getPreviewPlan -------------------------------- */
export const $getPreviewPlan: thisModule['$getPreviewPlan'] = async (parser) => {
  const res: Awaited<ReturnType<thisModule['$getPreviewPlan']>> = []
  const localStateObjects = await $fetchLocalStates(parser)
  const remoteStateObjects = await $fetchRemoteStates()

  // Improved loop by leveraging maps for quicker access
  const remoteStatesMap = new Map<string, StateObject>()
  for (const state of remoteStateObjects) {
    const key = `${state.metadata.database}.${state.metadata.schema}.${state.metadata.table}`
    remoteStatesMap.set(key, state)
  }

  for (const localState of localStateObjects) {
    const key = `${localState.metadata.database}.${localState.metadata.schema}.${localState.metadata.table}`
    const remoteState = remoteStatesMap.get(key)

    if (remoteState) {
      const remoteSpecMap = new Map<string, (typeof remoteState.spec)[number]>()
      remoteState.spec.forEach((col) => remoteSpecMap.set(col.column, col))

      localState.spec.forEach((localColumn) => {
        const remoteColumn = remoteSpecMap.get(localColumn.column)
        if (remoteColumn) {
          const localPrivilegesSet = new Set(
            localColumn.privileges.map((p) => `${p.role}:${p.privileges.sort().join(',')}`),
          )
          const remotePrivilegesSet = new Set(
            remoteColumn.privileges.map((p) => `${p.role}:${p.privileges.sort().join(',')}`),
          )

          localColumn.privileges.forEach((localGrant) => {
            const remoteGrant = remoteColumn.privileges.find((rg) => rg.role === localGrant.role)
            if (remoteGrant) {
              localGrant.privileges.forEach((privilege) => {
                if (!remoteGrant.privileges.includes(privilege)) {
                  res.push(_createPlanInfo('Grant', localState, localColumn, localGrant, privilege))
                }
              })
              remoteGrant.privileges.forEach((privilege) => {
                if (!localGrant.privileges.includes(privilege)) {
                  res.push(_createPlanInfo('Revoke', localState, localColumn, localGrant, privilege))
                }
              })
            } else {
              // If no corresponding remote grants, suggest adding all
              localGrant.privileges.forEach((privilege) => {
                res.push(_createPlanInfo('Grant', localState, localColumn, localGrant, privilege))
              })
            }
          })
        }
      })
    } else {
      // If no corresponding remote state, suggest adding all
      localState.spec.forEach((localColumn) => {
        localColumn.privileges.forEach((localGrant) => {
          localGrant.privileges.forEach((privilege) => {
            res.push(_createPlanInfo('Grant', localState, localColumn, localGrant, privilege))
          })
        })
      })
    }
  }

  return res
}

function _createPlanInfo(
  action: 'Grant' | 'Revoke',
  state: StateObject,
  column: (typeof state.spec)[number],
  grant: (typeof column.privileges)[number],
  privilege: string,
) {
  return {
    _kind_: 'PlanInfo' as const,
    localState: action === 'Grant' ? 'Present' : 'Absent',
    remoteState: action === 'Grant' ? 'Absent' : 'Present',
    plan: action,
    objectType: 'TableColumn Privilege',
    objectPath: `${state.metadata.schema}.${state.metadata.table}.${column.column}`,
    oldState: action === 'Grant' ? `Revoked ${privilege}` : `Granted ${privilege}`,
    newState: action === 'Grant' ? `Granted ${privilege}` : `Revoked ${privilege}`,
    sqlQuery: `${action.toUpperCase()} ${privilege} ON ${state.metadata.schema}."${state.metadata.table}" TO "${
      grant.role
    }";`,
  }
}
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
        state.metadata.database === row.database &&
        state.metadata.schema === row.schema &&
        state.metadata.table === row.table,
    )

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'TableColumnsPrivileges',
        metadata: {database: row.database, schema: row.schema, table: row.table},
        spec: [],
      })
      stateObjects.push(stateObj)
    }

    // Find the column object in the spec array
    let columnObj = stateObj.spec.find((column) => column.column === row.column)

    // If not found, create a new column object
    if (!columnObj) {
      columnObj = {column: row.column, privileges: []}
      stateObj.spec.push(columnObj)
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
        obj.metadata.schema === objA.metadata.schema &&
        obj.metadata.database === objA.metadata.database &&
        obj.metadata.table === objA.metadata.table,
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
        obj.metadata.table === objB.metadata.table,
    )

    if (!objA) {
      res.uniqueToB.push(objB)
    }
  }

  return res
}
