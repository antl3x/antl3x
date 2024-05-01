import { defineConfig } from "./@Config";

import { initRootStore } from "@rootStore";
import { checkDiff } from "@privileges/@syncEngine";
import * as onColumn from "@privileges/@onColumn";

initRootStore(
  defineConfig({
    pgConfig: {
      user: "postgres",
      database: "totuna",
      password: "",
    },
  }),
);

checkDiff(onColumn).then(console.log).catch(console.error);
