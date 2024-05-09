import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_ViewPrivileges, StateSchema} from './@CRD_ViewPrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_ViewPrivilegeYAML extends IRCDParser<ICRD_ViewPrivileges> {}

satisfies<ICRDParser_ViewPrivilegeYAML, typeof import('./@CRDParser_ViewPrivileges_YAML.js')>()

type thisModule = ICRDParser_ViewPrivilegeYAML

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
    return `${state.metadata.schema}.${state.metadata.view}--${state.kind.replace('Privileges', '')}.${FILE_EXTENSION}`
  }

  return `${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_VIEW_PRIVILEGES_PATH(
    state.metadata.schema,
    state.metadata.view,
  )}/${buildFileName(state, rootStore)}`
}
