import { Model, model, prop, modelFlow, _async, _await } from "mobx-keystone";
import { Config } from "./TotunaConfig";
import { Client, Pool } from "pg";
import { rootCtx } from "./RootCtx";
import { PrivilegesManager } from "./PrivilegesManager";
import { SystemVariables } from "./SystemVariables";
import fs from "fs";

@model("@totuna/RootStore")
export class RootStore extends Model({
  config: prop<Config>(),
  PrivilegesManager: prop<PrivilegesManager>(() => new PrivilegesManager({})),
  SystemVariables: prop<SystemVariables>(() => new SystemVariables({})),
  isDBReady: prop<boolean>(false),
}) {
  pgClient: Client = new Client(this.config.pgConfig);
  pgPool: Pool = new Pool(this.config.pgConfig);

  async onInit() {
    console.log("RootStore initialized");
    await this.connectToDB();
    this.setupInternalFolders();
  }

  setupInternalFolders() {
    fs.mkdirSync(this.SystemVariables.INTERNAL_FOLDER_PATH, {
      recursive: true,
    });

    fs.mkdirSync(this.SystemVariables.STATE_FILES_FOLDER_PATH, {
      recursive: true,
    });
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
