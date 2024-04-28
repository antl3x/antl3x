import { Model, model, prop, modelFlow, _async, _await } from "mobx-keystone";
import { Config } from "./TotunaConfig";
import { Client, Pool } from "pg";
import { rootCtx } from "./RootCtx";
import { PrivilegesSyncEngine } from "./PrivilegesTableSyncEn";

@model("@totuna/RootStore")
export class RootStore extends Model({
  config: prop<Config>(),
  PrivilegesSyncEngine: prop<PrivilegesSyncEngine>(
    () => new PrivilegesSyncEngine({})
  ),
  isDBReady: prop<boolean>(false),
}) {
  pgClient: Client = new Client(this.config.pgConfig);
  pgPool: Pool = new Pool(this.config.pgConfig);

  onInit(): void {
    console.log("RootStore initialized");
    this.connectToDB();
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
      });

      this.isDBReady = true;

      console.log("Connected to database");
    } catch (e) {
      console.error("Error connecting to database", e);
    }
  });
}
