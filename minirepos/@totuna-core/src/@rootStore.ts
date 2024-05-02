import type { defineConfig } from "@config.js";
import { satisfies } from "_utils_/@utils.js";
import { observable, when } from "mobx";

import { Config } from "@config.js";
import pg from "pg";

/* -------------------------------------------------------------------------- */
/*                                 Definition                                 */
/* -------------------------------------------------------------------------- */

satisfies<module>()(import("./@rootStore.js"));

export interface module {
  initRootStore: (config: Config) => Promise<RootStore_Ready>;
  getRootStore: () => Promise<RootStore_Ready>;
}

export type RootStore = RootStore_NotReady | RootStore_Ready;

export interface RootStore_NotReady {
  _metaStatus_: "notReady";
}

export interface RootStore_Ready {
  _metaStatus_: "ready";
  userConfig: Config;
  pgClient: pg.Client;
  systemVariables: SystemVariables;
}

interface SystemVariables {
  INTERNAL_PATH: string;
  PUBLIC_PATH: string;
  PUBLIC_DATABASE_PATH: string;
  INTERNAL_DATABASE_PATH: string;
  INTERNAL_STATE_PRIVILEGES_PATH: string;
  PUBLIC_STATE_PRIVILEGES_PATH: string;
  PUBLIC_MIGRATIONS_PATH: string;
}

/* -------------------------------------------------------------------------- */
/* RootStore */
/* -------------------------------------------------------------------------- */

let rootStore: RootStore = observable({
  _metaStatus_: "notReady" as const,
});

/* ------------------------------ initRootStore ----------------------------- */

export const initRootStore = async (userConfig: ReturnType<typeof defineConfig>): Promise<RootStore_Ready> => {
  const _rootStore = {
    _metaStatus_: "ready" as const,
    userConfig,
    pgClient: await _pgClient(userConfig),
    systemVariables: _systemVariables(userConfig),
  };
  rootStore = _rootStore;
  return rootStore;
};

/* ------------------------------ getRootStore ------------------------------ */

export const getRootStore = () => {
  return new Promise<RootStore_Ready>((resolve, reject) => {
    const react = when(
      () => rootStore._metaStatus_ === "ready",
      () => {
        resolve(rootStore as RootStore_Ready);
      },
    );

    setTimeout(() => {
      reject(new Error("[timeout] RootStore was not initialized or is not ready."));
      react();
    }, 1000);
  });
};

const _pgClient = async (userConfig: ReturnType<typeof defineConfig>) => {
  try {
    const pgClient = new pg.Client(userConfig.pgConfig);
    await pgClient.connect();
    return pgClient;
  } catch (error) {
    throw new Error(`Error connecting to the database: ${error}`);
  }
};

/* ---------------------------- _systemVariables ---------------------------- */

const _systemVariables = (userConfig: ReturnType<typeof defineConfig>): RootStore_Ready["systemVariables"] =>
  observable({
    INTERNAL_PATH: "._totuna_",
    PUBLIC_PATH: "@totuna",

    get PUBLIC_DATABASE_PATH() {
      return `${this.PUBLIC_PATH}/${userConfig.pgConfig.database}`;
    },

    get INTERNAL_DATABASE_PATH() {
      return `${this.INTERNAL_PATH}/${userConfig.pgConfig.database}`;
    },

    get INTERNAL_STATE_PRIVILEGES_PATH() {
      return `${this.INTERNAL_DATABASE_PATH}/privileges`;
    },

    get PUBLIC_STATE_PRIVILEGES_PATH() {
      return `${this.PUBLIC_DATABASE_PATH}/privileges`;
    },

    get PUBLIC_MIGRATIONS_PATH() {
      return `${this.PUBLIC_DATABASE_PATH}/migrations`;
    },
  });
