import { createContext } from "mobx-keystone";
import { Client, Pool } from "pg";
import { SystemVariables } from "./SystemVariables";

import { Config } from "@config";

export const rootCtx = createContext<{
  pgClient: Client;
  pgPool: Pool;
  config: Config;
  SystemVariables: SystemVariables;
}>();
