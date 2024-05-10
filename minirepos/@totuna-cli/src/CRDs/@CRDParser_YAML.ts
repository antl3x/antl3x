import {getRootStore} from '@RootStore.js'
import {globSync} from 'glob'
import {dump} from 'js-yaml'
import fs from 'node:fs'
import {satisfies} from 'utils/@utils.js'
import {parse} from 'yaml'
import {IRCDParser} from './ICRDParser.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_TablePrivilegeYAML extends IRCDParser {}

satisfies<ICRDParser_TablePrivilegeYAML, typeof import('./@CRDParser_YAML.js')>()

type thisModule = ICRDParser_TablePrivilegeYAML

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const FILE_EXTENSION = 'yaml'

/* ------------------------- $parseFileToStateObject ------------------------- */

export const $parseFileToStateObject: thisModule['$parseFileToStateObject'] = async (filePath, crd) => {
  const file = fs.readFileSync(filePath, 'utf8')
  return crd.StateSchema.parse(parse(file))
}

/* ------------------------- parseStateObjectToFile ------------------------- */

export const parseStateObjectToFile: thisModule['parseStateObjectToFile'] = (state) => {
  const content = dump(state, {
    indent: 2,
    flowLevel: 3,
    condenseFlow: false,
  })

  return content.replace(/]\n(\s+- role:)/gim, ']\n\n$1')
}

/* ------------------------------ buildFileName ----------------------------- */

export const buildFileName: thisModule['buildFileName'] = (state) => {
  return `${state.metadata.name}--${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${state.metadata.name}/${buildFileName(
    state,
    rootStore,
  )}`
}

/* ---------------------------- $fetchLocalStates --------------------------- */

export const $fetchLocalStates: thisModule['$fetchLocalStates'] = async (crd) => {
  // Fetch all files in the directory
  // Then check if the file is a valid CRD file
  // If not, log and skip
  // If valid, parse and return
  const rootStore = await getRootStore()

  const globPath = `${rootStore.systemVariables.PUBLIC_DATABASE_PATH}/**/*.${FILE_EXTENSION}`

  const filesPaths = globSync(globPath)
  const validFiles: Awaited<ReturnType<typeof $parseFileToStateObject>>[] = []

  for (const filePath of filesPaths) {
    try {
      const parsedfile = await $parseFileToStateObject(filePath, crd)
      validFiles.push(parsedfile)
    } catch {
      continue
    }
  }

  return validFiles
}
