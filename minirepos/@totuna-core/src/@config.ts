import { Model, prop, model, SnapshotInOfModel, fromSnapshot } from "mobx-keystone";
import { PoolConfig, ClientConfig } from "pg";

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

@model("@totuna/Config/v1")
export class Config extends Model({
  pgConfig: prop<PoolConfig | ClientConfig>(),
  cli: prop<{
    useTTY: boolean;
  }>(),
}) {}

/* ------------------------------ defineConfig ------------------------------ */

export const defineConfig = (config: SnapshotInOfModel<Config>): Config => {
  // We need to add $modelType to the config object in a deep way to make it work
  return fromSnapshot({
    ...config,
    $modelType: "@totuna/Config/v1",
  }) as Config;
};
