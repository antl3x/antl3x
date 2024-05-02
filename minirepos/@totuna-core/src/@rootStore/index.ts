import type { defineConfig } from "@config/index.js";
import { satisfies } from "@utils/index.js";
import { observable, when } from "mobx";
import pg from "pg";
import { RootStore, RootStore_Ready, defRootStore } from "./_impl_/defRootStore.js";

satisfies<defRootStore, typeof import("./index.js")>();

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

export const _pgClient = async (userConfig: ReturnType<typeof defineConfig>) => {
  try {
    const pgClient = new pg.Client(userConfig.pgConfig);
    await pgClient.connect();
    return pgClient;
  } catch (error) {
    throw new Error(`Error connecting to the database: ${error}`);
  }
};

/* ---------------------------- _systemVariables ---------------------------- */

export const _systemVariables = (userConfig: ReturnType<typeof defineConfig>): RootStore_Ready["systemVariables"] =>
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
  });
