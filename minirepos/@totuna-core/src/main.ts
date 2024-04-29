import { RootStore } from "./RootStore";
import { defineConfig } from "./TotunaConfig";
import { reaction } from "mobx";

const s = new RootStore({
  config: defineConfig({
    schemaName: "private_tables",
    pgConfig: {
      user: "postgres",
      database: "totuna",
      password: "",
    },
  }),
});

reaction(
  () => s.isDBReady,
  () => {
    if (s.isDBReady) {
      s.PrivilegesManager.pullPrivileges();
    }
  },
);
