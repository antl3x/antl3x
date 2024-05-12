import {z} from 'zod'
import * as jdp from 'jsondiffpatch'
import sqlFormatter from '@sqltools/formatter'

import type {ICRD} from './ICRD.js'

import {getRootStore} from '@RootStore.js'
import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_TableRLSPolicies extends ICRD<typeof StateSchema> {}

satisfies<ICRD_TableRLSPolicies, typeof import('./@CRD_TableRLSPolicies.js')>()

type thisModule = ICRD_TableRLSPolicies

export type StateObject = z.TypeOf<thisModule['StateSchema']>
export type TableRLSPolicies = Omit<StateObject, typeof z.BRAND>

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* --------------------------------- _kind_ --------------------------------- */

export const _kind_: thisModule['_kind_'] = 'TableRLSPolicies'

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  kind: z.literal('TableRLSPolicies'),
  metadata: z.object({
    name: z.string(),
  }),
  spec: z.object({
    database: z.string(),
    schema: z.string(),
    table: z.string(),
    rlsEnabled: z.boolean(),
    policies: z.array(
      z.object({
        name: z.string(),
        as: z.union([z.literal('RESTRICTIVE'), z.literal('PERMISSIVE')]),
        command: z.union([
          z.literal('SELECT'),
          z.literal('INSERT'),
          z.literal('UPDATE'),
          z.literal('DELETE'),
          z.literal('ALL'),
        ]),
        roles: z
          .array(z.string())
          .min(1)
          .refine(
            (val) => {
              const includesPublic = val.some((role) => role.toUpperCase() === 'PUBLIC')
              return !includesPublic || val.length === 1
            },
            {
              message: 'If role PUBLIC is present, no other role is allowed.',
            },
          ),
        using: z.nullable(z.string()),
        withCheck: z.nullable(z.string()),
      }),
    ),
  }),
})

/* --------------------------------- getPreviewPlan -------------------------------- */

export const $getPreviewPlan: thisModule['$getPreviewPlan'] = async (objInRemote, objInLocal) => {
  const res: Awaited<ReturnType<thisModule['$getPreviewPlan']>> = []

  const onRemote = _normalizeSpec(objInRemote)
  const onLocal = _normalizeSpec(objInLocal)
  const diffs = jdp.diff(onRemote, onLocal)

  for (const diffKey in diffs) {
    // @ts-expect-error
    const action = diffs[diffKey] as any[]

    /* ---------------------------- RLS Status Change --------------------------- */

    const isRlsStatusChange = diffKey.includes('rlsEnabled')
    if (isRlsStatusChange) {
      const command = action[1] ? 'ENABLE' : 'DISABLE'
      res.push({
        _kind_: 'PlanInfo' as const,
        localState: 'Present' as const,
        remoteState: 'Present' as const,
        plan: command === 'ENABLE' ? 'Enable RLS' : 'Disable RLS',
        objectType: 'Table RLS Status',
        objectPath: `${objInLocal.spec.schema}.${objInLocal.spec.table}`,
        oldState: `${action[1] ? 'DISABLED' : 'ENABLED'}`,
        newState: `${action[1] ? 'ENABLED' : 'DISABLED'}`,
        sqlQuery: `ALTER TABLE "${objInLocal.spec.schema}"."${objInLocal.spec.table}" ${command} ROW LEVEL SECURITY;`,
      })

      continue
    }

    /* ---------------------------- Policy Change --------------------------- */

    // IF ADDITION
    if (action.length === 1) {
      res.push({
        _kind_: 'PlanInfo' as const,
        localState: 'Present' as const,
        remoteState: 'Absent' as const,
        plan: 'Add Policy',
        objectType: 'Table RLS Policy',
        objectPath: `${objInLocal.spec.schema}.${objInLocal.spec.table}.${action[0].name}`,
        oldState: 'Absent',
        newState: 'Present',
        sqlQuery: `CREATE POLICY "${action[0].name}" ON "${objInLocal.spec.schema}"."${objInLocal.spec.table}" AS ${
          action[0].as
        } FOR ${action[0].command} TO ${action[0].roles.map((i: string) => `"${i}"`).join(', ')} USING (${
          action[0].using
        }) WITH CHECK (${action[0].withCheck});`,
      })

      continue
    }

    // IF REMOVAL
    if (action.length === 3) {
      res.push({
        _kind_: 'PlanInfo' as const,
        localState: 'Absent' as const,
        remoteState: 'Present' as const,
        plan: 'Remove Policy',
        objectType: 'Table RLS Policy',
        objectPath: `${objInLocal.spec.schema}.${objInLocal.spec.table}.${action[0].name}`,
        oldState: `Present`,
        newState: 'Absent',
        sqlQuery: `DROP POLICY "${action[0].name}" ON "${objInLocal.spec.schema}"."${objInLocal.spec.table}";`,
      })
      continue
    }

    // IF UPDATE

    const policyName = diffKey.split('.')[1]
    const policy = objInLocal.spec.policies.find((i) => i.name === policyName)!
    const policyRoles = policy.roles.map((i) => (i.toLowerCase() === 'public' ? i : `"${i}"`)).join(', ')

    res.push({
      _kind_: 'PlanInfo' as const,
      localState: 'Present' as const,
      remoteState: 'Present' as const,
      plan: 'Update Policy',
      objectType: 'Table RLS Policy',
      objectPath: `${objInLocal.spec.schema}.${objInLocal.spec.table}.${policy.name}`,
      oldState: `Present`,
      newState: 'Updated',
      sqlQuery: `DROP POLICY "${policy.name}" ON "${objInLocal.spec.schema}"."${objInLocal.spec.table}";
  CREATE POLICY "${policy.name}" ON "${objInLocal.spec.schema}"."${objInLocal.spec.table}" AS ${policy.as} FOR ${policy.command} TO ${policyRoles} USING (${policy.using}) WITH CHECK (${policy.withCheck});`,
    })
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
    name: string
    as: 'PERMISSIVE' | 'RESTRICTIVE'
    apply_on: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL'
    table: string
    apply_for: string
    using: string
    with_check: string
    rls_enabled: boolean
  }>(`
  SELECT n.nspname AS schema,
  current_database() as database,
  c.relname AS table,
  c.relrowsecurity AS rls_enabled,  -- directly retrieving RLS enabled status
  pol.polname AS name,
  CASE 
      WHEN pol.polpermissive THEN 'PERMISSIVE'::text
      ELSE 'RESTRICTIVE'::text
  END AS as,
  CASE
      WHEN pol.polroles = '{0}'::oid[] THEN string_to_array('PUBLIC'::text, ''::text)::name[]
      ELSE ARRAY( SELECT pg_authid.rolname
                  FROM pg_authid
                  WHERE pg_authid.oid = ANY (pol.polroles)
                  ORDER BY pg_authid.rolname)
  END AS apply_for,
  CASE pol.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      WHEN '*' THEN 'ALL'
      ELSE NULL
  END AS apply_on,
  pg_get_expr(pol.polqual, pol.polrelid) AS using,
  pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check
  FROM pg_class c
  LEFT JOIN pg_namespace n ON n.oid = c.relnamespace
  LEFT JOIN pg_policy pol ON c.oid = pol.polrelid
  WHERE c.relkind = 'r'
  AND n.nspname NOT LIKE 'pg_%'
  AND n.nspname != 'information_schema'
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
        kind: 'TableRLSPolicies',
        metadata: {
          name: `${row.database}.${row.schema}.${row.table}`,
        },
        spec: {
          database: row.database,
          schema: row.schema,
          table: row.table,
          rlsEnabled: row.rls_enabled,
          policies: [],
        },
      } as TableRLSPolicies)
      stateObjects.push(stateObj)
    }

    // Early return if no policy is found
    if (!row.name) continue

    stateObj.spec.policies.push({
      name: row.name,
      as: row.as,
      command: row.apply_on,
      roles: row.apply_for.slice(1, -1).split(','),
      using: row.using ? sqlFormatter.format(row.using) : null,
      withCheck: row.with_check ? sqlFormatter.format(row.with_check) : null,
    })
  }
  return stateObjects
}

/* ------------------------ getUniqueKey ------------------------ */
export const getUniqueKey: thisModule['getUniqueKey'] = (obj) => {
  return `${obj.kind}-${obj.spec.database}-${obj.spec.schema}-${obj.spec.table}`
}

/* ----------------------------- _normalizeSpec ----------------------------- */

function _normalizeSpec(obj: StateObject) {
  const normalized = {} as Record<string, StateObject['spec']['policies'][0] | boolean>

  const baseKey = getUniqueKey(obj)

  const key = `${baseKey}.rlsEnabled`
  normalized[key] = obj.spec.rlsEnabled

  for (const policy of obj.spec.policies) {
    const key = `${baseKey}.${policy.name}`
    normalized[key] = policy
  }

  return normalized
}
