import type {z} from 'zod'
import type {ICRD} from './ICRD.js'

export interface IRCDParser<CRD extends ICRD> {
  parseFileToStateObject: (file: string) => z.TypeOf<CRD['StateSchema']>
  parseStateObjectToFile: (state: z.TypeOf<CRD['StateSchema']>) => string
}
