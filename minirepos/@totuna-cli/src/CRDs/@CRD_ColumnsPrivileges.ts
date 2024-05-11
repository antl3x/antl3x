import {z} from 'zod'
import * as jdp from 'jsondiffpatch'

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

export const $getPreviewPlan: thisModule['$getPreviewPlan'] = async (objInRemote, objInLocal) => {
  const res: Awaited<ReturnType<thisModule['$getPreviewPlan']>> = []

  const onRemote = _normalizeSpec(objInRemote)
  const onLocal = _normalizeSpec(objInLocal)
  const diffs = jdp.diff(onRemote, onLocal)

  for (const diffKey in diffs) {
    const [, column, role, privilege] = diffKey.split('.')

    // @ts-expect-error
    const action = diffs[diffKey] as any[]

    // IF ADDITION
    if (action.length === 1) {
      res.push(_createPlan('Grant', objInLocal, column, role, privilege))
    }

    // IF REMOVAL
    if (action.length === 3) {
      res.push(_createPlan('Revoke', objInLocal, column, role, privilege))
    }
  }

  return res
}

/* ------------------------------- _createPlan ------------------------------ */

function _createPlan(action: 'Grant' | 'Revoke', state: StateObject, column: string, role: string, privilege: string) {
  const fromOrTo = action === 'Grant' ? 'TO' : 'FROM'
  const scapedRole = role.toLowerCase() === 'public' ? `PUBLIC` : `"${role}"`
  return {
    _kind_: 'PlanInfo' as const,
    localState: action === 'Grant' ? ('Present' as const) : ('Absent' as const),
    remoteState: action === 'Grant' ? ('Absent' as const) : ('Present' as const),
    plan: action,
    objectType: 'Column Privilege',
    objectPath: `${state.spec.schema}.${state.spec.table}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role}`,
    sqlQuery: `${action.toUpperCase()} ${privilege}("${column}") ON TABLE "${state.spec.schema}".${
      state.spec.table
    } ${fromOrTo} ${scapedRole};`,
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

/* ------------------------ getUniqueKey ------------------------ */
export const getUniqueKey: thisModule['getUniqueKey'] = (obj) => {
  return `${obj.kind}-${obj.spec.database}.${obj.spec.schema}.${obj.spec.table}`
}

/* ----------------------------- _normalizeSpec ----------------------------- */

function _normalizeSpec(obj: StateObject) {
  const normalized = {} as Record<string, boolean>

  const baseKey = getUniqueKey(obj)

  for (const priv of obj.spec.privileges) {
    for (const privilege of priv.privileges) {
      const key = `${baseKey}.${priv.column}.${privilege.role}.${privilege.privileges}`
      normalized[key] = true
    }
  }

  return normalized
}
