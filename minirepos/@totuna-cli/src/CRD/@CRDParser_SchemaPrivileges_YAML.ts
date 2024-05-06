import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_SchemaPrivilege} from './@CRD_SchemaPrivileges.js'
import fs from 'node:fs'
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

export const parseFileToStateObject: thisModule['parseFileToStateObject'] = (file) => {
  return parse(file)
}

export const parseStateObjectToFile: thisModule['parseStateObjectToFile'] = (state) => {
  return stringify(state)
}

export const buildFileName: thisModule['buildFileName'] = (state) => {
  return `${state.spec.schema}.${state.kind}.${FILE_EXTENSION}`
}

export const buildFilePath: thisModule['buildFilePath'] = (state, rootStore) => {
  return `${rootStore.systemVariables.PUBLIC_CRD_SCHEMA_PRIVILEGES_PATH(state.spec.schema)}/${buildFileName(state)}`
}