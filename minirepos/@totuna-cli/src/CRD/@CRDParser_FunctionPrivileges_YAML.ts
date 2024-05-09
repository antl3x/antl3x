import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_FunctionPrivileges, StateSchema} from './@CRD_FunctionPrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_FunctionPrivilegeYAML extends IRCDParser<ICRD_FunctionPrivileges> {}

satisfies<ICRDParser_FunctionPrivilegeYAML, typeof import('./@CRDParser_FunctionPrivileges_YAML.js')>()

type thisModule = ICRDParser_FunctionPrivilegeYAML

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const FILE_EXTENSION = 'yaml'

/* ------------------------- parseFileToStateObject ------------------------- */

export const parseFileToStateObject: thisModule['parseFileToStateObject'] = (file) => {
  return StateSchema.parse(parse(file))
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

export const buildFileName: thisModule['buildFileName'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${state.kind}.${state.metadata.schema}.${state.metadata.function}.${FILE_EXTENSION}`
  }

  return `${state.metadata.function}.${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_DATABASE_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_FUNCTION_PRIVILEGES_PATH(
    state.metadata.schema,
  )}/_functions_/${buildFileName(state, rootStore)}`
}
