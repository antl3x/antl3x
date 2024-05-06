import {RootStore__Ready} from '@RootStore.js'
import type {IRCDParser} from './ICRDParser.js'
import {z} from 'zod'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD<
  StateSchema extends z.Schema<unknown & {kind: string; metadata: {name: string}; spec: unknown}> = z.Schema,
  StateObject extends z.TypeOf<StateSchema> = z.TypeOf<StateSchema>,
  StateDiff = any,
> {
  _kind_: StateObject['kind']
  /* ------------------------------- StateSchema ------------------------------ */

  StateSchema: StateSchema

  /* --------------------------------- compare -------------------------------- */

  $compare: (parser: IRCDParser<ICRD>) => Promise<StateDiff>

  /* ---------------------------------- apply --------------------------------- */

  apply: (state: StateObject) => MigrationFile

  /* ---------------------------------- $apply --------------------------------- */

  $apply: (state: StateObject) => {_kind_: 'AppliedWithSuccess'} | {_kind_: 'AppliedWithFailure'; error: Error}

  /* ---------------------------------- plan ---------------------------------- */

  plan: (state: StateObject) => MigrationFile

  /* ---------------------------------- $plan ---------------------------------- */

  $plan: (state: StateObject) => Promise<
    {
      _kind_: 'PlanInfo'
      localState: 'Present' | 'Absent'
      remoteState: 'Present' | 'Absent' | 'Outdated'
      plan: string
      objectType: string
      objectPath: string
      oldValue: string
      newValue: string
    }[]
  >

  /* -------------------------------- validate -------------------------------- */

  validate: (state: StateObject) => true | Error

  /* ---------------------------------- $pull --------------------------------- */

  $pull: () => Promise<StateObject[]>

  /* ---------------------------- $fetchLocalStates ---------------------------- */

  $fetchLocalStates(parser: IRCDParser<ICRD>): Promise<StateObject[]>

  /* --------------------------- $fetchRemoteStates --------------------------- */

  $fetchRemoteStates(): Promise<StateObject[]>
}

export type MigrationFile = string
