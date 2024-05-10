import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

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

export const StateSchema = z.object({
  kind: z.literal('DatabasePrivileges'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    privileges: z.array(
      z.object({
        role: z.string(),
        privileges: z.array(z.union([z.literal('CREATE'), z.literal('CONNECT'), z.literal('TEMPORARY')])),
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
    objectType: 'Database Privilege',
    objectPath: `${state.spec.database}`,
    oldState: `${action === 'Grant' ? 'No' : 'Granted'} ${privilege} TO ${role.role}`,
    newState: `${action === 'Grant' ? 'Granted' : 'Revoked'} ${privilege} TO ${role.role}`,
    sqlQuery: `${action.toUpperCase()} ${privilege} ON DATABASE ${state.spec.database} TO "${role.role}";`,
  }
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
    let stateObj = stateObjects.find((state) => state.spec.database === row.database)

    // If not found, create a new state object
    if (!stateObj) {
      stateObj = StateSchema.parse({
        kind: 'DatabasePrivileges',
        metadata: {
          name: `${row.database}`,
        },
        spec: {
          database: row.database,
          privileges: [],
        },
      } as DatabasePrivileges)
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

export const diffStateObjects: thisModule['diffStateObjects'] = (remote, local) => {
  const res = {
    uniqueToRemote: [],
    uniqueToLocal: [],
    common: [],
  } as ReturnType<thisModule['diffStateObjects']>

  for (const objA of remote) {
    const objB = local.find((obj) => obj.kind === objA.kind && obj.spec.database === objA.spec.database)

    if (!objB) {
      res.uniqueToRemote.push(objA)
    } else {
      res.common.push(objA)
    }
  }

  for (const objB of local) {
    const objA = remote.find((obj) => obj.kind === objB.kind && obj.spec.database === objB.spec.database)

    if (!objA) {
      res.uniqueToLocal.push(objB)
    }
  }

  return res
}
