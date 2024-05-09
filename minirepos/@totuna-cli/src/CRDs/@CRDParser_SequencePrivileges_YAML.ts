import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_SequencePrivileges, StateSchema} from './@CRD_SequencePrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_SequencePrivilegeYAML extends IRCDParser<ICRD_SequencePrivileges> {}

satisfies<ICRDParser_SequencePrivilegeYAML, typeof import('./@CRDParser_SequencePrivileges_YAML.js')>()

type thisModule = ICRDParser_SequencePrivilegeYAML

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
    return `${state.metadata.schema}.${state.metadata.sequence}--${state.kind.replace(
      'Privileges',
      '',
    )}.${FILE_EXTENSION}`
  }

  return `${state.metadata.sequence}.${state.kind}.${FILE_EXTENSION}`
}

/* ------------------------------ buildFilePath ----------------------------- */

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  if (rootStore.userConfig.useFlatFolder) {
    return `${rootStore.systemVariables.PUBLIC_PRIVILEGES_FLAT_PATH}/${buildFileName(state, rootStore)}`
  }

  return `${rootStore.systemVariables.PUBLIC_CRD_SEQUENCE_PRIVILEGES_PATH(
    state.metadata.schema,
  )}/_sequences_/${buildFileName(state, rootStore)}`
}
