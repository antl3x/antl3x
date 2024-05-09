import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_SchemaPrivilege, StateSchema} from './@CRD_SchemaPrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'

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

/* ------------------------- $parseFileToStateObject ------------------------- */

export const $parseFileToStateObject: thisModule['$parseFileToStateObject'] = async (file) => {
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
    return `${state.metadata.schema}--${state.kind.replace('Privileges', '')}.${FILE_EXTENSION}`
  }

  return `${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_SCHEMA_PRIVILEGES_PATH(state.metadata.schema)}/${buildFileName(
    state,
    rootStore,
  )}`
}
