import config from "./totuna.config.js";

import { getRootStore, initRootStore } from "@totuna/core/@rootStore";
// import * as api from "@totuna/core/privileges/@api";
import * as api from "@totuna/core/rls/@api";

import { SchemaConverter } from "pg-tables-to-jsonschema";

(async () => {
  await initRootStore(config);

  // api.pullAllPrivileges(false);
  console.log(await api.checkDiff());
})();
