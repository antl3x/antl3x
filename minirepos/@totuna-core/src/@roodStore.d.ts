import { Config } from "@config.js";
import pg from "pg";

export interface defRootStore {
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
