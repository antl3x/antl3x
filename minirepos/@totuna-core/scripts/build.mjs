import { build } from "esbuild";
import { replaceTscAliasPaths } from "tsc-alias";

/** @type (any) => esbuild.Plugin */
const tscAliasPlugin = (format) => {
  return {
    name: "tsc-alias",
    setup(build) {
      build.onEnd(async () => {
        await replaceTscAliasPaths({ outDir: "./dist/" + format, resolveFullPaths: true });
      });
    },
  };
};

(async () => {
  await build({
    entryPoints: ["src/**/*.ts"],
    bundle: false,
    platform: "node",
    target: "es2022",
    format: "esm",
    outdir: "dist/esm",
    plugins: [tscAliasPlugin("esm")],
  });
  await build({
    entryPoints: ["src/**/*.ts"],
    outdir: "dist/cjs",
    bundle: false,
    platform: "node",
    target: "es2022",
    format: "cjs",
    plugins: [tscAliasPlugin("cjs")],
  });
})();
