import {observable, when} from 'mobx'

import pg from 'pg'
import {satisfies} from 'utils/@utils.js'
import {Config} from '@config.js'

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module, typeof import('./@RootStore.js')>

export interface module {
  initRootStore: (config: Config) => Promise<RootStore__Ready>
  getRootStore: () => Promise<RootStore__Ready>
}

export type RootStore = RootStore__NotReady | RootStore__Ready

export interface RootStore__NotReady {
  _kind_: 'RootStore__NotReady'
}

export interface RootStore__Ready {
  _kind_: 'RootStore__Ready'
  userConfig: Config
  pgClient: pg.Client
  systemVariables: SystemVariables
}

interface SystemVariables {
  PUBLIC_PATH: string
  PUBLIC_MIGRATIONS_PATH: string
  PUBLIC_MIGRATIONS_PLAN_PATH: string
  CRD_FOLDER_STRATEGY__TOTAL_FLAT__FOLDER_PATH: string
  CRD_FOLDER_STRATEGY__FLAT_BY_TYPE__FOLDER_PATH(type: '_privileges_' | '_policies_'): string
  CRD_FOLDER_STRATEGY__NESTED_BY_OBJECT_PATH__FOLDER_PATH(objectPath: string): string
}

/* -------------------------------------------------------------------------- */
/* RootStore */
/* -------------------------------------------------------------------------- */

let rootStore: RootStore = observable({
  _kind_: 'RootStore__NotReady' as const,
})

/* ------------------------------ initRootStore ----------------------------- */

export const initRootStore = async (userConfig: Config): Promise<RootStore__Ready> => {
  const defRootStore = {
    _kind_: 'RootStore__Ready' as const,
    userConfig,
    pgClient: await _pgClient(userConfig),
    systemVariables: _systemVariables(userConfig),
  }
  rootStore = defRootStore
  return defRootStore
}

/* ------------------------------ getRootStore ------------------------------ */

export const getRootStore = () => {
  return new Promise<RootStore__Ready>((resolve, reject) => {
    const react = when(
      () => rootStore._kind_ === 'RootStore__Ready',
      () => {
        resolve(rootStore as RootStore__Ready)
      },
    )

    setTimeout(() => {
      reject(new Error('[timeout] RootStore was not initialized or is not ready.'))
      react()
    }, 1000)
  })
}

const _pgClient = async (userConfig: Config) => {
  try {
    const pgClient = new pg.Client(userConfig.pgConfig)
    await pgClient.connect()
    return pgClient
  } catch (error) {
    throw new Error(`Error connecting to the database: ${error}`)
  }
}

/* ---------------------------- _systemVariables ---------------------------- */

const _systemVariables = (userConfig: Config): RootStore__Ready['systemVariables'] =>
  observable({
    PUBLIC_PATH: '@totuna',

    get CRD_FOLDER_STRATEGY__TOTAL_FLAT__FOLDER_PATH() {
      return `${this.PUBLIC_PATH}`
    },

    CRD_FOLDER_STRATEGY__FLAT_BY_TYPE__FOLDER_PATH(type) {
      return `${this.PUBLIC_PATH}/${type}`
    },

    CRD_FOLDER_STRATEGY__NESTED_BY_OBJECT_PATH__FOLDER_PATH(objectPath) {
      return `${this.PUBLIC_PATH}/${objectPath}`
    },

    get PUBLIC_MIGRATIONS_PATH() {
      return `${this.PUBLIC_PATH}/_migrations_`
    },
    get PUBLIC_MIGRATIONS_PLAN_PATH() {
      return `${this.PUBLIC_PATH}/_migrations_/_plan_`
    },
  })
