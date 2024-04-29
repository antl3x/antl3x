import { build } from "esbuild";
import { aliasPath } from "esbuild-plugin-alias-path";
import path from "path";

(async () => {
  await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "es2015",
    format: "esm",
    outfile: "dist/esm/index.js",
    plugins: [
      aliasPath({
        alias: {
          "@/*": path.resolve(process.cwd(), "./src"),
        },
      }),
    ],
  });
  await build({
    entryPoints: ["src/index.ts"],
    bundle: true,
    platform: "node",
    target: "es2015",
    format: "cjs",
    outfile: "dist/cjs/index.js",
    plugins: [
      aliasPath({
        alias: {
          "@/*": path.resolve(process.cwd(), "./src"),
        },
      }),
    ],
  });
})();
