import { createContext } from "mobx-keystone";
import { Client, Pool } from "pg";
import { Config } from "./TotunaConfig";

export const rootCtx = createContext<{
  pgClient: Client;
  pgPool: Pool;
  config: Config;
}>();
