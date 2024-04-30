import { Model, model, prop } from "mobx-keystone";
import { rootCtx } from "./RootCtx";

@model("@totuna/SystemVariables")
export class SystemVariables extends Model({
  INTERNAL_FOLDER_PATH: prop<string>("._totuna_"),
}) {
  get STATE_FILES_FOLDER_PATH() {
    return `${this.INTERNAL_FOLDER_PATH}/${rootCtx.get(this)!.config.pgConfig.database}/state-files`;
  }

  get STATE_FILES_PRIVILEGE_ON_SEQUENCE_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_Sequence.state.json`;
  }

  get STATE_FILES_PRIVILEGE_ON_FUNCTION_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_Function.state.json`;
  }

  get STATE_FILES_PRIVILEGE_ON_DATABASE_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_Database.state.json`;
  }

  get STATE_FILES_PRIVILEGE_ON_SCHEMA_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_Schema.state.json`;
  }

  get STATE_FILES_PRIVILEGE_ON_TABLE_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_Table.state.json`;
  }

  get STATE_FILES_PRIVILEGE_ON_VIEW_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_View.state.json`;
  }

  get STATE_FILES_PRIVILEGE_ON_COLUMN_PATH() {
    return `${this.STATE_FILES_FOLDER_PATH}/Privileges_On_Column.state.json`;
  }
}
