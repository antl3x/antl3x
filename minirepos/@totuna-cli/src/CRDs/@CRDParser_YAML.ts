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
  const content = dump(state)

  return content
}

/* ------------------------------ buildFileName ----------------------------- */

export const buildFileName: thisModule['buildFileName'] = (state, rootStore) => {
  switch (rootStore.userConfig.crdFolderStrategy) {
    case 'totalFlat':
      return `${state.metadata.name}--${state.kind}.${FILE_EXTENSION}`

    case 'flatByType':
      return `${state.metadata.name}--${state.kind}.${FILE_EXTENSION}`

    case 'nestedByObjectPath':
      return `${state.kind}.${FILE_EXTENSION}`
  }
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  const stateKind = state.kind as string
  switch (rootStore.userConfig.crdFolderStrategy) {
    case 'totalFlat':
      return `${rootStore.systemVariables.PUBLIC_PATH}/${buildFileName(state, rootStore)}`

    case 'flatByType':
      switch (true) {
        case stateKind.includes('Privileges'):
          return `${rootStore.systemVariables.CRD_FOLDER_STRATEGY__FLAT_BY_TYPE__FOLDER_PATH(
            '_privileges_',
          )}/${buildFileName(state, rootStore)}`

        case stateKind.includes('Policies'):
          return `${rootStore.systemVariables.CRD_FOLDER_STRATEGY__FLAT_BY_TYPE__FOLDER_PATH(
            '_policies_',
          )}/${buildFileName(state, rootStore)}`
      }

    case 'nestedByObjectPath':
      return `${rootStore.systemVariables.CRD_FOLDER_STRATEGY__NESTED_BY_OBJECT_PATH__FOLDER_PATH(
        _buildNestedByObjectPath(state),
      )}/${buildFileName(state, rootStore)}`
  }
}

/* ---------------------------- $fetchLocalStates --------------------------- */

export const $fetchLocalStates: thisModule['$fetchLocalStates'] = async (crd) => {
  // Fetch all files in the directory
  // Then check if the file is a valid CRD file
  // If not, log and skip
  // If valid, parse and return
  const rootStore = await getRootStore()

  const globPath = `${rootStore.systemVariables.PUBLIC_PATH}/**/*.${FILE_EXTENSION}`

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

/* ------------------------ _buildNestedByObjectPath ------------------------ */
function _buildNestedByObjectPath(state: any) {
  const propertyArray = ['database', 'schema', 'function', 'table', 'sequence']

  let path = ''

  propertyArray.forEach((property) => {
    if (state.spec[property]) {
      path += `/${state.spec[property]}`
    }
  })

  return path.replace('/', '')
}
