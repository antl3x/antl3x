import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_TablePrivileges, StateSchema} from './@CRD_TablePrivileges.js'
import {parse, stringify} from 'yaml'
import {dump} from 'js-yaml'
import fs from 'node:fs'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_TablePrivilegeYAML extends IRCDParser<ICRD_TablePrivileges> {}

satisfies<ICRDParser_TablePrivilegeYAML, typeof import('./@CRDParser_TablePrivileges_YAML.js')>()

type thisModule = ICRDParser_TablePrivilegeYAML

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const FILE_EXTENSION = 'yaml'

/* ------------------------- $parseFileToStateObject ------------------------- */

export const $parseFileToStateObject: thisModule['$parseFileToStateObject'] = async (filePath) => {
  const file = fs.readFileSync(filePath, 'utf8')
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
