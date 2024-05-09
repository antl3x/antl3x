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

  $getPreviewPlan: <A extends StateSchema, B extends StateObject>(
    parser: IRCDParser<ICRD<A, B>>,
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

  diffStateObjects<A extends StateObject[], B extends StateObject[]>(
    a: A,
    b: B,
  ): {
    uniqueToA: StateObject[]
    uniqueToB: StateObject[]
    common: StateObject[]
  }
}

export type MigrationFile = string
