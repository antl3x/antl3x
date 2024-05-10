import {BRAND, z} from 'zod'
import type {Delta} from 'jsondiffpatch'

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

  $getPreviewPlan: <A extends StateObject>(
    objInRemote: A,
    objInLocal: A,
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

  /* ------------------------ getUniqueKey ------------------------ */
  /**
   * # Overview
   * Given an StateObject we generate a unique identifier
   */
  getUniqueKey(object: StateObject): string
}

export type MigrationFile = string
