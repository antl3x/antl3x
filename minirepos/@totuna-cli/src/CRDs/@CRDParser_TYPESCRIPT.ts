import path from 'node:path'
import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {getRootStore} from '@RootStore.js'
import {globSync} from 'glob'
/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_TYPESCRIPT extends IRCDParser {}

satisfies<ICRDParser_TYPESCRIPT, typeof import('./@CRDParser_TYPESCRIPT.js')>()

type thisModule = ICRDParser_TYPESCRIPT

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const FILE_EXTENSION = 'ts'

/* ------------------------- $parseFileToStateObject ------------------------- */

export const $parseFileToStateObject: thisModule['$parseFileToStateObject'] = async (filePath, crd) => {
  const file = await import(path.resolve(filePath))
  return crd.StateSchema.parse(file.default)
}

/* ------------------------- parseStateObjectToFile ------------------------- */

export const parseStateObjectToFile: thisModule['parseStateObjectToFile'] = (state) => {
  let fileContent = `import type { ${state.kind} } from "@totuna/cli/@CRDs/@CRD_${state.kind}.js"
  
  export default ${JSON.stringify(state, null, 2).replace(/"([^"]+)":/g, '$1:')} satisfies ${state.kind};`

  return fileContent
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
