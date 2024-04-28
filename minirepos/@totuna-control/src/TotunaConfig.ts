import {
  Model,
  prop,
  model,
  SnapshotInOfModel,
  fromSnapshot,
} from "mobx-keystone";
import { PoolConfig, ClientConfig } from "pg";
import { types } from "util";

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
  types: prop<string>(_getEnvOr(["TOTUNA_TYPES_FOLDER"], "_@types")),
  executions: prop<string>(
    _getEnvOr(["TOTUNA_EXECUTIONS_FOLDER"], "_executions")
  ),
  privileges: prop<string>(
    _getEnvOr(["TOTUNA_PRIVILEGES_FOLDER"], "_privileges")
  ),
  main: prop<string>(_getEnvOr(["TOTUNA_MAIN_FOLDER"], "totuna")),
}) {
  get privilegesPath() {
    return this.main + "/" + this.privileges;
  }
  get typesPath() {
    return this.main + "/" + this.types;
  }
  get executionsPath() {
    return this.main + "/" + this.executions;
  }
}

@model("@totuna/Config/v1/FileNames")
export class ConfigFileNames extends Model({
  privilegesTable: prop<string>("Tables.privileges.ts"),
  privilegesColumns: prop<string>("Columns.privileges.ts"),
}) {
  executionSQL: () => string = () => {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "");
    return `_${timestamp}.sql`;
  };
}

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

@model("@totuna/Config/v1")
export class Config extends Model({
  pgConfig: prop<PoolConfig | ClientConfig>(),
  schemaName: prop<string>(_getEnvOr(["TOTUNA_SCHEMA_NAME"], "public")),
  folderNames: prop<ConfigFolderNames>(() => new ConfigFolderNames({})),
  fileNames: prop<ConfigFileNames>(() => new ConfigFileNames({})),
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
