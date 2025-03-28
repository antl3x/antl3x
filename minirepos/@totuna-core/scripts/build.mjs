import { build } from "esbuild";
import { replaceTscAliasPaths } from "tsc-alias";
import { replaceExtensionInImports } from "./fixDeclarations.mjs";
import path from "node:path";

/** @type (any) => esbuild.Plugin */
const tscAliasPlugin = (format) => {
  return {
    name: "tsc-alias",
    setup(build) {
      build.onEnd(async () => {
        await replaceTscAliasPaths({ outDir: "./dist/" + format });
      });
    },
  };
};

(async () => {
  await build({
    entryPoints: ["src/**/*.ts"],
    bundle: false,
    platform: "node",
    treeShaking: true,
    target: "es2022",
    format: "esm",
    sourcemap: true,
    outdir: "dist/esm",
    plugins: [tscAliasPlugin("esm")],
  });
  await build({
    entryPoints: ["src/**/*.ts"],
    outdir: "dist/cjs",
    bundle: false,
    sourcemap: true,
    platform: "node",
    target: "es2022",
    format: "cjs",
    plugins: [tscAliasPlugin("cjs")],
  });

  replaceExtensionInImports(path.resolve("./dist/types"));

  await replaceTscAliasPaths({
    outDir: "./dist/types",
    resolveFullPaths: true,
    verbose: true,
  });
})();
