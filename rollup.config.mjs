import pluginTypeScript from "rollup-plugin-typescript2";
import pluginNodeResolve from "@rollup/plugin-node-resolve";
import pluginJson from "@rollup/plugin-json";
import pluginHtml from "rollup-plugin-html";
import pluginCss from "rollup-plugin-import-css";
import pluginExecute from "rollup-plugin-execute";
import typescript from "typescript";

import pkg from "./package.json" with { type: "json" };

const outputDir = ".";
const outputFile = getOutputFileName();

/** @param {string} [suffix] */
function getOutputFileName(suffix) {
  return `${pkg.userscriptName}${suffix ?? ""}.user.js`;
}

export default (/**@type {import("./src/types").RollupArgs}*/ args) => (async () => {
  /** @type {import("./src/types").RollupArgs} */
  const passCliArgs = {
    mode: args["config-mode"] ?? (process.env.NODE_ENV === "production" ? "production" : "development"),
    assetSource: args["config-assetSource"] ?? "github",
    suffix: args["config-suffix"] ?? "",
  };
  const passCliArgsStr = Object.entries(passCliArgs).map(([key, value]) => `--${key}=${value}`).join(" ");

  const { mode, suffix } = passCliArgs;

  /** @type {import("rollup").RollupOptions} */
  const config = {
    input: "src/index.ts",
    plugins: [
      pluginNodeResolve({
        extensions: [".ts", ".mts", ".json"],
      }),
      pluginTypeScript({
        typescript,
        tsconfig: "./tsconfig.json",
        tsconfigOverride: {
          compilerOptions: {
            sourceMap: mode === "development",
          },
        },
        clean: true,
        check: false,
      }),
      pluginJson(),
      pluginHtml(),
      pluginCss({
        output: "global.css",
      }),
      pluginExecute([
        `npm run --silent post-build -- ${passCliArgsStr}`,
        // #MARKER run own commands after build:
        // ...(mode === "development" ? ["npm run --silent invisible -- \"echo 'dev-only command'\""] : []),
      ]),
    ],
    output: {
      file: `${outputDir}/${getOutputFileName(suffix)}`,
      format: "iife",
      sourcemap: mode === "development",
      compact: mode === "development",
    },
    onwarn(warning) {
      // ignore circular dependency warnings
      if(warning.code !== "CIRCULAR_DEPENDENCY") {
        const { message, ...rest } = warning;
        console.error(`\x1b[33m(!)\x1b[0m ${message}\n`, rest);
      }
    },
  };

  return config;
})();

export { outputDir, outputFile };
