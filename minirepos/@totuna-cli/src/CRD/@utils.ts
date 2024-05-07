import {satisfies} from 'utils/@utils.js'
import {ICRD} from './ICRD.js'
import {z} from 'zod'
import {globSync} from 'glob'
import {getRootStore} from '@RootStore.js'
import {IRCDParser} from './ICRDParser.js'
import fs from 'node:fs'
/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface IUtils {
  $fetchLocalStates: <T extends ICRD<any>>(parser: IRCDParser<T>) => Promise<z.TypeOf<T['StateSchema']>[]>
}

type thisModule = IUtils

satisfies<IUtils, typeof import('./@utils.js')>()

/* ---------------------------- $fetchLocalStates --------------------------- */

export const $fetchLocalStates: thisModule['$fetchLocalStates'] = async (parser) => {
  // Fetch all files in the directory
  // Then check if the file is a valid CRD file
  // If not, log and skip
  // If valid, parse and return
  const rootStore = await getRootStore()

  const globPath = `${rootStore.systemVariables.PUBLIC_DATABASE_PATH}/**/*.${parser.FILE_EXTENSION}`

  const filesPaths = globSync(globPath)
  const validFiles: ReturnType<typeof parser.parseFileToStateObject>[] = []

  for (const file of filesPaths) {
    try {
      const parsedfile = parser.parseFileToStateObject(fs.readFileSync(file, 'utf8'))
      validFiles.push(parsedfile)
    } catch {
      continue
    }
  }

  return validFiles
}
