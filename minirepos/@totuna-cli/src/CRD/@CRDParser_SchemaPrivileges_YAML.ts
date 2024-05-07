import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_SchemaPrivilege, StateSchema} from './@CRD_SchemaPrivileges.js'
import {parse, stringify} from 'yaml'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_SchemaPrivilegeYAML extends IRCDParser<ICRD_SchemaPrivilege> {}

satisfies<ICRDParser_SchemaPrivilegeYAML, typeof import('./@CRDParser_SchemaPrivileges_YAML.js')>()

type thisModule = ICRDParser_SchemaPrivilegeYAML

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
  return stringify(state)
}

/* ------------------------------ buildFileName ----------------------------- */

export const buildFileName: thisModule['buildFileName'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${state.metadata.schema}.${state.kind}.${FILE_EXTENSION}`
  }

  return `${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_DATABASE_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_SCHEMA_PRIVILEGES_PATH(state.metadata.schema)}/${buildFileName(
    state,
    rootStore,
  )}`
}
