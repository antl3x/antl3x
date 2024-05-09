import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_TablePrivileges, StateSchema} from './@CRD_TablePrivileges.js'
import path from 'node:path'
/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_TablePrivilegeYAML extends IRCDParser<ICRD_TablePrivileges> {}

satisfies<ICRDParser_TablePrivilegeYAML, typeof import('./@CRDParser_TablePrivileges_YAML.js')>()

type thisModule = ICRDParser_TablePrivilegeYAML

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const FILE_EXTENSION = 'ts'

/* ------------------------- $parseFileToStateObject ------------------------- */

export const $parseFileToStateObject: thisModule['$parseFileToStateObject'] = async (filePath) => {
  const file = await import(path.resolve(filePath))
  return StateSchema.parse(file.default)
}

/* ------------------------- parseStateObjectToFile ------------------------- */

export const parseStateObjectToFile: thisModule['parseStateObjectToFile'] = (state) => {
  let fileContent = `import type { ${state.kind} } from "@totuna/cli/@CRDs/@CRD_${state.kind}.js"
  
  export default ${JSON.stringify(state, null, 2).replace(/"([^"]+)":/g, '$1:')} satisfies ${state.kind};`

  return fileContent
}

/* ------------------------------ buildFileName ----------------------------- */

export const buildFileName: thisModule['buildFileName'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${state.metadata.schema}.${state.metadata.table}--${state.kind.replace('Privileges', '')}.${FILE_EXTENSION}`
  }

  return `${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_TABLE_PRIVILEGES_PATH(
    state.metadata.schema,
    state.metadata.table,
  )}/${buildFileName(state, rootStore)}`
}
