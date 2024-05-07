import type {z} from 'zod'
import type {ICRD} from './ICRD.js'
import {RootStore__Ready} from '@RootStore.js'

export interface IRCDParser<CRD extends ICRD> {
  FILE_EXTENSION: string

  buildFileName(state: z.TypeOf<CRD['StateSchema']>, rootStore: RootStore__Ready): string
  buildFilePath(state: z.TypeOf<CRD['StateSchema']>, rootStore: RootStore__Ready): string

  parseFileToStateObject: (file: string) => z.TypeOf<CRD['StateSchema']>
  parseStateObjectToFile: (state: z.TypeOf<CRD['StateSchema']>) => string
}
