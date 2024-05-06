import {z} from 'zod'

import type {ICRD} from './ICRD.js'

import {satisfies} from 'utils/@utils.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD_SchemaPrivilege extends ICRD<typeof StateSchema> {}

satisfies<ICRD_SchemaPrivilege, typeof import('./@CRD_SchemaPrivilege.js')>()

type thisModule = ICRD_SchemaPrivilege

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

/* ------------------------------- StateSchema ------------------------------ */

export const StateSchema = z.object({
  name: z.string(),
  privileges: z.array(z.string()),
})

export const StateDiff = z.object({
  name: z.string(),
  privileges: z.array(z.string()),
})

/* --------------------------------- compare -------------------------------- */

export const compare: thisModule['compare'] = (stateA, stateB) => {
  return {
    name: stateB.name,
    privileges: stateB.privileges,
  }
}

/* ---------------------------------- apply --------------------------------- */

export const apply: thisModule['apply'] = (state) => {
  return `CREATE SCHEMA ${state.name}`
}

/* ---------------------------------- plan ---------------------------------- */

export const plan: thisModule['plan'] = (state) => {
  return `CREATE SCHEMA ${state.name}`
}

/* -------------------------------- validate -------------------------------- */

export const validate: thisModule['validate'] = (state) => {
  return true
}

/* --------------------------------- $apply --------------------------------- */

export const $apply: thisModule['$apply'] = (state) => {
  return {_kind_: 'AppliedWithSuccess'}
}

/* ---------------------------------- $plan --------------------------------- */

export const $plan: thisModule['$plan'] = (state) => {
  return {_kind_: 'PlanInfo'}
}

/* ---------------------------------- $pull --------------------------------- */

export const $pull: thisModule['$pull'] = () => {
  return {_kind_: 'Pulled'}
}
