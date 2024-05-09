import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_ColumnsPrivileges, StateSchema} from './@CRD_ColumnsPrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_ColumnsPrivilegeYAML extends IRCDParser<ICRD_ColumnsPrivileges> {}

satisfies<ICRDParser_ColumnsPrivilegeYAML, typeof import('./@CRDParser_ColumnsPrivileges_YAML.js')>()

type thisModule = ICRDParser_ColumnsPrivilegeYAML

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
    return `${state.metadata.schema}.${state.metadata.table}--${state.kind.replace('Privileges', '')}.${FILE_EXTENSION}`
  }

  return `${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_TABLECOLUMNS_PRIVILEGES_PATH(
    state.metadata.schema,
    state.metadata.table,
  )}/${buildFileName(state, rootStore)}`
}
