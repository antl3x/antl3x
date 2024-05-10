import {BRAND, z} from 'zod'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

type CommonSchema = z.ZodSchema<{
  kind: unknown
  metadata: {
    name: string
  } & unknown
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

  $getPreviewPlan: (diffObjects: ReturnType<ICRD<StateSchema, StateObject>['diffStateObjects']>) => Promise<
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
    remoteStateObjects: StateObject[],
    localStateObjects: StateObject[],
  ): {
    uniqueToRemote: StateObject[]
    uniqueToLocal: StateObject[]
    common: StateObject[]
  }
}

export type MigrationFile = string
