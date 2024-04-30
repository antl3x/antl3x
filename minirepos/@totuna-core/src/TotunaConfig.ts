import { Model, prop, model, SnapshotInOfModel, fromSnapshot } from "mobx-keystone";
import { PoolConfig, ClientConfig } from "pg";
import { types } from "util";
import { rootCtx } from "./RootCtx";

// Utility function to get environment variables or default values
const _getEnvOr = <A>(keys: string[], defaultValue: A): A => {
  for (const key of keys) {
    if (process.env[key]) {
      return process.env[key] as A;
    }
  }
  return defaultValue;
};

@model("@totuna/Config/v1/FolderNames")
export class ConfigFolderNames extends Model({
  types: prop<string>(_getEnvOr(["TOTUNA_TYPES_FOLDER"], "types")),
  executions: prop<string>(_getEnvOr(["TOTUNA_EXECUTIONS_FOLDER"], "executions")),
  privileges: prop<string>(_getEnvOr(["TOTUNA_PRIVILEGES_FOLDER"], "privileges")),
  main: prop<string>(_getEnvOr(["TOTUNA_MAIN_FOLDER"], "@totuna")),
}) {
  get DatabasePath() {
    return this.main + "/" + rootCtx.get(this)?.config.pgConfig.database;
  }
  get privilegesPath() {
    return this.DatabasePath + "/" + this.privileges;
  }
  get privilegesOnSequencePath() {
    return this.privilegesPath + "/sequences";
  }
  get privilegesOnFunctionPath() {
    return this.privilegesPath + "/functions";
  }
  get privilegesOnDatabasePath() {
    return this.privilegesPath + "/databases";
  }
  get privilegesOnSchemaPath() {
    return this.privilegesPath + "/schemas";
  }
  get privilegesOnTablePath() {
    return this.privilegesPath + "/tables";
  }
  get privilegesOnViewPath() {
    return this.privilegesPath + "/views";
  }
  get privilegesOnColumnPath() {
    return this.privilegesPath + "/columns";
  }
  get typesPath() {
    return this.DatabasePath + "/" + this.types;
  }
  get executionsPath() {
    return this.DatabasePath + "/" + this.executions;
  }
}

@model("@totuna/Config/v1/FileNames")
export class ConfigFileNames extends Model({
  privilegesTable: prop<string>("Privilege_Tables.ts"),
  privilegesColumns: prop<string>("Privilege_Columns.ts"),
}) {
  executionSQL: () => string = () => {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    return `_${timestamp}.sql`;
  };
}

@model("@totuna/Config/v1/Aggregators")
export class ConfigAggregators extends Model({
  privilegesOnTable: prop<"ByTable_ThenRole">("ByTable_ThenRole"),
  privilegesOnColumn: prop<"ByTable_ThenColumn_ThenRole">("ByTable_ThenColumn_ThenRole"),
}) {}

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

@model("@totuna/Config/v1")
export class Config extends Model({
  pgConfig: prop<PoolConfig | ClientConfig>(),
  schemaName: prop<string>(_getEnvOr(["TOTUNA_SCHEMA_NAME"], "public")),
  folderNames: prop<ConfigFolderNames>(() => new ConfigFolderNames({})),
  fileNames: prop<ConfigFileNames>(() => new ConfigFileNames({})),
  aggregators: prop<ConfigAggregators>(() => new ConfigAggregators({})),
}) {}

/* ------------------------------ defineConfig ------------------------------ */

export const defineConfig = (config: SnapshotInOfModel<Config>): Config => {
  // We need to add $modelType to the config object in a deep way to make it work

  return fromSnapshot({
    ...config,
    $modelType: "@totuna/Config/v1",
    fileNames: {
      ...config.fileNames,
      $modelType: "@totuna/Config/v1/FileNames",
    },
    folderNames: {
      ...config.folderNames,
      $modelType: "@totuna/Config/v1/FolderNames",
    },
  }) as Config;
};
