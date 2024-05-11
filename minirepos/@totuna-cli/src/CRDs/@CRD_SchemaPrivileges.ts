import {z} from 'zod'
import * as jdp from 'jsondiffpatch'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_SchemaPrivilege extends ICRD<typeof StateSchema> {}

satisfies<ICRD_SchemaPrivilege, typeof import('./@CRD_SchemaPrivileges.js')>()

type thisModule = ICRD_SchemaPrivilege

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type SchemaPrivileges = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'SchemaPrivileges'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  kind: z.literal('SchemaPrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    privileges: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(z.union([z.literal('USAGE'), z.literal('CREATE')])),
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
    objectType: 'Schema Privilege',
    objectPath: `${state.spec.schema}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role}`,
    sqlQuery: `${action.toUpperCase()} ${privilege} ON SCHEMA "${state.spec.schema}" ${fromOrTo} ${scapedRole};`,
  }
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
 SELECT
 n.nspname AS schema,
 current_database() AS database,
 COALESCE(r.rolname, 'PUBLIC') AS grantee,
 COALESCE(a.privilege_type, '__NO_PRIVILEGES__') AS privilege
FROM
 pg_namespace n
LEFT JOIN
 aclexplode(n.nspacl) a ON TRUE
LEFT JOIN
 pg_roles r ON a.grantee = r.oid
WHERE
 n.nspname NOT IN ('pg_catalog', 'information_schema')
 AND (r.rolname IS NULL OR r.rolname NOT LIKE 'pg\_%')
 AND n.nspname NOT LIKE 'pg\_%'
 
ORDER BY
 n.nspname, grantee;`)

  const stateObjects: StateObject[] = []

  for (const row of rows) {
    // Find the state object for the schema
    let stateObj = stateObjects.find((state) => state.spec.schema === row.schema)

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'SchemaPrivileges',
        metadata: {
          name: `${row.database}.${row.schema}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          privileges: [],
        },
      } as SchemaPrivileges)
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
  return `${obj.kind}-${obj.spec.database}-${obj.spec.schema}`
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
