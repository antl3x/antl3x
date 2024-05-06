import {satisfies} from 'utils/@utils.js'
import {IRCDParser} from './ICRDParser.js'
import {ICRD_SchemaPrivilege} from './@CRD_SchemaPrivilege.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

export interface ICRDParser_SchemaPrivilegeYAML extends IRCDParser<ICRD_SchemaPrivilege> {}

satisfies<ICRDParser_SchemaPrivilegeYAML, typeof import('./@CRDParser_SchemaPrivilegeYAML.js')>()

type thisModule = ICRDParser_SchemaPrivilegeYAML

/* -------------------------------------------------------------------------- */
/*                               Implementation                               */
/* -------------------------------------------------------------------------- */

export const parseFileToStateObject: thisModule['parseFileToStateObject'] = (file) => {
  return {
    name: 'schema',
    privileges: ['privilege'],
  }
}

export const parseStateObjectToFile: thisModule['parseStateObjectToFile'] = (state) => {
  return `CREATE SCHEMA ${state.name}`
}
