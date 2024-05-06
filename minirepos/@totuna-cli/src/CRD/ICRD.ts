import {z} from 'zod'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD<
  StateSchema extends z.Schema = z.Schema,
  StateObject extends z.TypeOf<StateSchema> = z.TypeOf<StateSchema>,
  StateDiff = any,
> {
  /* ------------------------------- StateSchema ------------------------------ */

  StateSchema: StateSchema

  /* --------------------------------- compare -------------------------------- */

  compare: (stateA: StateObject, stateB: StateObject) => StateDiff

  /* ---------------------------------- apply --------------------------------- */

  apply: (state: StateObject) => MigrationFile

  /* ---------------------------------- $apply --------------------------------- */

  $apply: (state: StateObject) => {_kind_: 'AppliedWithSuccess'} | {_kind_: 'AppliedWithFailure'; error: Error}

  /* ---------------------------------- plan ---------------------------------- */

  plan: (state: StateObject) => MigrationFile

  /* ---------------------------------- $plan ---------------------------------- */

  $plan: (state: StateObject) => {_kind_: 'PlanInfo'}

  /* -------------------------------- validate -------------------------------- */

  validate: (state: StateObject) => true | Error

  /* ---------------------------------- $pull --------------------------------- */

  $pull: () => {_kind_: 'Pulled'} | {_kind_: 'PulledWithFailure'; error: Error}
}

export type MigrationFile = string
