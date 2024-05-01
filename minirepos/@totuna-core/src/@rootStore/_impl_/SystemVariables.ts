import { Model, model, prop } from "mobx-keystone";
import { rootCtx } from "./rootCtx";

@model("@totuna/SystemVariables")
export class SystemVariables extends Model({
  INTERNAL_PATH: prop<string>("._totuna_"),
  PUBLIC_PATH: prop<string>("@totuna"),
}) {
  get PUBLIC_DATABASE_PATH() {
    return `${this.PUBLIC_PATH}/${rootCtx.get(this)!.config.pgConfig.database}`;
  }
  get INTERNAL_DATABASE_PATH() {
    return `${this.INTERNAL_PATH}/${rootCtx.get(this)!.config.pgConfig.database}`;
  }

  get INTERNAL_STATE_PRIVILEGES_PATH() {
    return `${this.INTERNAL_DATABASE_PATH}/privileges`;
  }

  get PUBLIC_STATE_PRIVILEGES_PATH() {
    return `${this.PUBLIC_DATABASE_PATH}/privileges`;
  }
}
