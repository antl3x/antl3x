import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_TableColumnsPrivileges, StateSchema} from './@CRD_TableColumnsPrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_TableColumnsPrivilegeYAML extends IRCDParser<ICRD_TableColumnsPrivileges> {}

satisfies<ICRDParser_TableColumnsPrivilegeYAML, typeof import('./@CRDParser_TableColumnsPrivileges_YAML.js')>()

type thisModule = ICRDParser_TableColumnsPrivilegeYAML

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
    flowLevel: 5,
    condenseFlow: false,
  })
  // break line on '- role:' but keep identation
  // also break line on - column: and keep identation
  return content.replace(/(\s+- column:)/g, '\n$1').replace(/]\n(\s+- role:)/gim, ']\n\n$1')
}

/* ------------------------------ buildFileName ----------------------------- */

export const buildFileName: thisModule['buildFileName'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${state.kind}.${state.metadata.schema}.${state.metadata.table}.${FILE_EXTENSION}`
  }

  return `${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_DATABASE_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_TABLECOLUMNS_PRIVILEGES_PATH(
    state.metadata.schema,
    state.metadata.table,
  )}/${buildFileName(state, rootStore)}`
}
