import confing from "../totuna.config";
import { RootStore } from "./RootStore";
import { reaction } from "mobx";

export const rootStore = new RootStore({
  config: confing,
});

const disposer = reaction(
  () => rootStore.isDBReady,
  async () => {
    rootStore.PrivilegesSyncEngine.sync();
  }
);
