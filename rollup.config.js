import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import replace from 'rollup-plugin-replace';

const packageJson = require("./package.json");

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
                sourcemap: true,
            },
            {
                file: packageJson.module,
                format: "esm",
                sourcemap: true,
            },
        ],
        plugins: [
            peerDepsExternal(),
            commonjs(),
            nodePolyfills(),
            resolve({ preferBuiltins: true }),
            replace({
                // FIXME: https://github.com/facebook/create-react-app/issues/11756
                "require('fs')": "require('util')",
                delimiters: ['', '']
            }),
            typescript({ tsconfig: "./tsconfig.json" }),
        ],
    },
    {
        input: "lib/types/index.d.ts",
        output: [{ file: "lib/index.d.ts", format: "esm" }],
        plugins: [dts()],
    },
];
