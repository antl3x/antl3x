import type {z} from 'zod'
import type {ICRD} from './ICRD.js'
import {RootStore__Ready} from '@RootStore.js'

export interface IRCDParser {
  FILE_EXTENSION: string

  buildFileName(state: z.TypeOf<ICRD['StateSchema']>, rootStore: RootStore__Ready): string
  buildFilePath(state: z.TypeOf<ICRD['StateSchema']>, rootStore: RootStore__Ready): string

  $parseFileToStateObject: (file: string, crd: ICRD) => Promise<z.TypeOf<ICRD['StateSchema']>>
  parseStateObjectToFile: <A extends z.TypeOf<ICRD['StateSchema']>>(state: A) => string

  $fetchLocalStates: <B extends z.ZodType, T extends ICRD<B>>(
    crd: T,
  ) => Promise<
    {
      filePath: string
      object: z.TypeOf<ICRD['StateSchema']>
    }[]
  >
}
