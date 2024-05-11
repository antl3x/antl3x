import {z} from 'zod'
import * as jdp from 'jsondiffpatch'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

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

export const StateSchema = z.object({
  kind: z.literal('FunctionPrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    function: z.string(),
    privileges: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(z.literal('EXECUTE')),
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
    const [, role, privilege] = diffKey.split('.')

    // @ts-expect-error
    const action = diffs[diffKey] as any[]

    // IF ADDITION
    if (action.length === 1) {
      res.push(_createPlan('Grant', objInLocal, role, privilege))
    }

    // IF REMOVAL
    if (action.length === 3) {
      res.push(_createPlan('Revoke', objInLocal, role, privilege))
    }
  }

  return res
}

/* ------------------------------- _createPlan ------------------------------ */

function _createPlan(action: 'Grant' | 'Revoke', state: StateObject, role: string, privilege: string) {
  const fromOrTo = action === 'Grant' ? 'TO' : 'FROM'
  const scapedRole = role.toLowerCase() === 'public' ? `PUBLIC` : `"${role}"`
  return {
    _kind_: 'PlanInfo' as const,
    localState: action === 'Grant' ? ('Present' as const) : ('Absent' as const),
    remoteState: action === 'Grant' ? ('Absent' as const) : ('Present' as const),
    plan: action,
    objectType: 'Function Privilege',
    objectPath: `${state.spec.schema}.${state.spec.function}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role}`,
    sqlQuery: `${action.toUpperCase()} ${privilege} ON FUNCTION "${state.spec.schema}".${
      state.spec.function
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
  COALESCE(a.privilege_type, '__NO_PRIVILEGES__') AS privilege
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
      (state) => state.spec.schema === row.schema && state.spec.function === row.function,
    )

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'FunctionPrivileges',
        metadata: {
          name: `${row.database}.${row.schema}.${row.function}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          function: row.function,
          privileges: [],
        },
      } as FunctionPrivileges)
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

/* ------------------------ getUniqueKey ------------------------ */
export const getUniqueKey: thisModule['getUniqueKey'] = (obj) => {
  return `${obj.kind}-${obj.spec.database}-${obj.spec.schema}-${obj.spec.function}`
}

/* ----------------------------- _normalizeSpec ----------------------------- */

function _normalizeSpec(obj: StateObject) {
  const normalized = {} as Record<string, boolean>

  const baseKey = getUniqueKey(obj)

  for (const priv of obj.spec.privileges) {
    for (const privilege of priv.privileges) {
      const key = `${baseKey}.${priv.role}.${privilege}`
      normalized[key] = true
    }
  }

  return normalized
}
