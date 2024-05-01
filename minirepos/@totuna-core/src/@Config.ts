import { Model, prop, model, SnapshotInOfModel, fromSnapshot } from "mobx-keystone";
import { PoolConfig, ClientConfig } from "pg";

// Utility function to get environment variables or default values
// const _getEnvOr = <A>(keys: string[], defaultValue: A): A => {
//   for (const key of keys) {
//     if (process.env[key]) {
//       return process.env[key] as A;
//     }
//   }
//   return defaultValue;
// };

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

@model("@totuna/Config/v1")
export class Config extends Model({
  pgConfig: prop<PoolConfig | ClientConfig>(),
}) {}

/* ------------------------------ defineConfig ------------------------------ */

export const defineConfig = (config: SnapshotInOfModel<Config>): Config => {
  // We need to add $modelType to the config object in a deep way to make it work

  return fromSnapshot({
    ...config,
    $modelType: "@totuna/Config/v1",
  }) as Config;
};
