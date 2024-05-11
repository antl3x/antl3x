import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'
import * as jdp from 'jsondiffpatch'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_ViewPrivileges extends ICRD<typeof StateSchema> {}

satisfies<ICRD_ViewPrivileges, typeof import('./@CRD_ViewPrivileges.js')>()

type thisModule = ICRD_ViewPrivileges

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type ViewPrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'ViewPrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  kind: z.literal('ViewPrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    view: z.string(),
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
    objectType: 'Table Privilege',
    objectPath: `${state.spec.schema}.${state.spec.view}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role}`,
    sqlQuery: `${action.toUpperCase()} ${privilege} ON TABLE "${state.spec.schema}"."${
      state.spec.view
    }" ${fromOrTo} ${scapedRole};`,
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
    view: string
  }>(`
  SELECT
    current_database() AS database,
    n.nspname AS schema,
    c.relname AS view,
    CASE
        WHEN r.rolname IS NULL THEN 'PUBLIC'
        ELSE r.rolname
    END AS grantee,
    CASE
        WHEN a.privilege_type = 'SELECT' THEN 'SELECT'
        WHEN a.privilege_type = 'INSERT' THEN 'INSERT'
        WHEN a.privilege_type = 'UPDATE' THEN 'UPDATE'
        WHEN a.privilege_type = 'DELETE' THEN 'DELETE'
        WHEN a.privilege_type = 'TRUNCATE' THEN 'TRUNCATE'
        WHEN a.privilege_type = 'REFERENCES' THEN 'REFERENCES'
        WHEN a.privilege_type = 'TRIGGER' THEN 'TRIGGER'
    END AS privilege
FROM
    pg_class c
    JOIN pg_namespace n ON c.relnamespace = n.oid
    LEFT JOIN aclexplode(c.relacl) a ON TRUE
    LEFT JOIN pg_roles r ON a.grantee = r.oid
WHERE
    c.relkind = 'v'
    AND (n.nspname NOT IN ('pg_catalog', 'information_schema'))
    AND (r.rolname NOT LIKE 'pg\_%' OR r.rolname IS NULL)
ORDER BY
    schema,
    "view",
    grantee;
`)

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find(
      (state) =>
        state.spec.database === row.database && state.spec.schema === row.schema && state.spec.view === row.view,
    )

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'ViewPrivileges',
        metadata: {
          name: `${row.database}.${row.schema}.${row.view}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          view: row.view,
          privileges: [],
        },
      } as ViewPrivileges)
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

/* ------------------------ getUniqueKey ------------------------ */
export const getUniqueKey: thisModule['getUniqueKey'] = (obj) => {
  return `${obj.kind}-${obj.spec.database}-${obj.spec.schema}-${obj.spec.view}`
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
