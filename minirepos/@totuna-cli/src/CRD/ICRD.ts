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

  /* ---------------------------------- $plan ---------------------------------- */

  $getPreviewPlan: (parser: IRCDParser<ICRD>) => Promise<
    {
      _kind_: 'PlanInfo'
      localState: 'Present' | 'Absent'
      remoteState: 'Present' | 'Absent' | 'Outdated'
      plan: string
      objectType: string
      objectPath: string
      oldState: string
      newState: string
      sqlQuery: string
    }[]
  >

  /* ---------------------------- $fetchLocalStates ---------------------------- */

  $fetchLocalStates(parser: IRCDParser<ICRD>): Promise<StateObject[]>

  /* --------------------------- $fetchRemoteStates --------------------------- */

  $fetchRemoteStates(): Promise<StateObject[]>
}

export type MigrationFile = string
