import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import filesize from 'rollup-plugin-filesize';
import fs from 'fs'

const packageJson = JSON.parse(fs.readFileSync("./package.json").toString());

export default [
    {
        input: "src/index.ts",
        output: [
            {
                file: packageJson.main,
                format: "cjs",
            },
            {
                file: packageJson.module,
                format: "esm",
            },
        ],
        plugins: [
            peerDepsExternal(),
            commonjs(),
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
