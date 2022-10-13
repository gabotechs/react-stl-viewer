import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import filesize from 'rollup-plugin-filesize';

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
            typescript({ tsconfig: "./tsconfig.json" }),
            filesize()
        ],
    },
    {
        input: "lib/types/index.d.ts",
        output: [{ file: "lib/index.d.ts", format: "esm" }],
        plugins: [dts()],
    },
];
