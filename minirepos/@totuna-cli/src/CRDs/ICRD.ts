import {BRAND, z} from 'zod'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

type CommonSchema = z.ZodSchema<{
  kind: any
  metadata: {
    name: string
  } & any
  spec: any
}>

export interface ICRD<
  StateSchema extends CommonSchema = CommonSchema,
  StateObject extends z.TypeOf<StateSchema> = z.TypeOf<StateSchema>,
> {
  _kind_: StateObject['kind']

  /* ------------------------------- StateSchema ------------------------------ */

  StateSchema: StateSchema

  /* ---------------------------------- $getPreviewPlan ---------------------------------- */

  $getPreviewPlan: <A>(localStateObjects: A[] extends StateObject[] ? A[] : never) => Promise<
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

  diffStateObjects<A>(
    a: A extends StateObject ? A[] : never,
    b: A extends StateObject ? A[] : never,
  ): {
    uniqueToA: A[]
    uniqueToB: A[]
    common: A[]
  }
}

export type MigrationFile = string
