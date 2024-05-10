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

export const $getPreviewPlan: thisModule['$getPreviewPlan'] = async ({uniqueToLocal, uniqueToRemote}) => {
  const res: Awaited<ReturnType<thisModule['$getPreviewPlan']>> = []

  for (const state of uniqueToLocal) {
    for (const role of state.spec.privileges) {
      for (const privilege of role.privileges) {
        res.push(_createPlan('Grant', state, role, privilege))
      }
    }
  }

  for (const state of uniqueToRemote) {
    for (const role of state.spec.privileges) {
      for (const privilege of role.privileges) {
        res.push(_createPlan('Revoke', state, role, privilege))
      }
    }
  }

  return res
}

/* ------------------------------- _createPlan ------------------------------ */

function _createPlan(
  action: 'Grant' | 'Revoke',
  state: StateObject,
  role: StateObject['spec']['privileges'][0],
  privilege: string,
) {
  return {
    _kind_: 'PlanInfo' as const,
    localState: action === 'Grant' ? ('Present' as const) : ('Absent' as const),
    remoteState: action === 'Grant' ? ('Absent' as const) : ('Present' as const),
    plan: action,
    objectType: 'Table Privilege',
    objectPath: `${state.spec.schema}.${state.spec.table}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role.role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role.role}`,
    sqlQuery: `${action.toUpperCase()} ${privilege} ON TABLE "${state.spec.schema}"."${state.spec.table}" TO "${
      role.role
    }";`,
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

export const diffStateObjects: thisModule['diffStateObjects'] = (remote, local) => {
  const res = {
    uniqueToRemote: [],
    uniqueToLocal: [],
    common: [],
  } as ReturnType<thisModule['diffStateObjects']>

  for (const objA of remote) {
    const objB = local.find(
      (obj) =>
        obj.kind === objA.kind &&
        obj.spec.schema === objA.spec.schema &&
        obj.spec.database === objA.spec.database &&
        obj.spec.table === objA.spec.table &&
        obj.spec.privileges === objA.spec.privileges,
    )

    if (!objB) {
      res.uniqueToRemote.push(objA)
    } else {
      res.common.push(objA)
    }
  }

  for (const objB of local) {
    const objA = remote.find(
      (obj) =>
        obj.kind === objB.kind &&
        obj.spec.schema === objB.spec.schema &&
        obj.spec.database === objB.spec.database &&
        obj.spec.table === objB.spec.table &&
        obj.spec.privileges === objB.spec.privileges,
    )

    if (!objA) {
      res.uniqueToLocal.push(objB)
    }
  }

  return res
}
