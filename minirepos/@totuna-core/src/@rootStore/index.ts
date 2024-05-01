import { reaction, when } from "mobx";
import { Model, _async, _await, model, modelFlow, prop } from "mobx-keystone";
import { Client, Pool } from "pg";

import type { Config, defineConfig } from "@config";

import { rootCtx } from "./_impl_/rootCtx";
import { SystemVariables } from "./_impl_/SystemVariables";

/* -------------------------------------------------------------------------- */
/*                                  RootStore                                 */
/* -------------------------------------------------------------------------- */

let rootStore: RootStore;

/* ------------------------------ initRootStore ----------------------------- */

export const initRootStore = (config: ReturnType<typeof defineConfig>) =>
  new Promise<void>((resolve) => {
    rootStore = new RootStore({
      config,
    });

    reaction(
      () => rootStore.isDBReady,
      (isDBReady) => {
        if (isDBReady) {
          resolve();
        }
      },
    );
  });

/* ------------------------------ getRootStore ------------------------------ */

export const getRootStore = () =>
  new Promise<RootStore>((resolve) => {
    when(
      () => rootStore.isDBReady,
      () => {
        if (rootStore.isDBReady) {
          resolve(rootStore);
        }
      },
    );
  });

/* -------------------------------- RootStore ------------------------------- */

@model("@totuna/RootStore")
class RootStore extends Model({
  config: prop<Config>(),
  // PrivilegesManager: prop<PrivilegesManager>(() => new PrivilegesManager({})),
  SystemVariables: prop<SystemVariables>(() => new SystemVariables({})),
  isDBReady: prop<boolean>(false),
}) {
  pgClient: Client = new Client(this.config.pgConfig);
  pgPool: Pool = new Pool(this.config.pgConfig);

  async onInit() {
    console.log("RootStore initialized");
    await this.connectToDB();
  }
  @modelFlow
  connectToDB = _async(function* (this: RootStore) {
    try {
      yield* _await(this.pgClient.connect());
      yield* _await(this.pgPool.connect());

      rootCtx.set(this, {
        pgClient: this.pgClient,
        pgPool: this.pgPool,
        config: this.config,
        SystemVariables: this.SystemVariables,
      });

      this.isDBReady = true;

      console.log("Connected to database");
    } catch (e) {
      console.error("Error connecting to database", e);
    }
  });
}
