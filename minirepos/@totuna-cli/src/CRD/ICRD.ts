import type {IRCDParser} from './ICRDParser.js'
import {z} from 'zod'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRD<
  StateSchema extends z.Schema<unknown & {kind: string; metadata: unknown; spec: unknown}> = z.Schema,
  StateObject extends z.TypeOf<StateSchema> = z.TypeOf<StateSchema>,
> {
  _kind_: StateObject['kind']

  /* ------------------------------- StateSchema ------------------------------ */

  StateSchema: StateSchema

  /* ---------------------------------- $getPreviewPlan ---------------------------------- */

  $getPreviewPlan: <T extends IRCDParser<ICRD<StateSchema, StateObject>>>(
    parser: T,
  ) => Promise<
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

  /* --------------------------- $fetchRemoteStates --------------------------- */

  $fetchRemoteStates(): Promise<StateObject[]>

  /* ------------------------ diffStateObjects ------------------------ */

  diffStateObjects(
    a: StateObject[],
    b: StateObject[],
  ): {
    uniqueToA: StateObject[]
    uniqueToB: StateObject[]
    common: StateObject[]
  }
}

export type MigrationFile = string
