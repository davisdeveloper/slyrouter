// rollup.config.js
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

// Main bundle config
const mainConfig = {
    input: 'src/index.js',
    output: [
        {
            file: 'dist/slyrouter.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'dist/slyrouter.cjs.js',
            format: 'cjs',
            sourcemap: true,
            exports: 'default'
        },
        {
            file: 'dist/slyrouter.umd.js',
            format: 'umd',
            name: 'SlyRouter',
            sourcemap: true
        }
    ],
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        terser()
    ]
};

// Core bundle config
const coreConfig = {
    input: 'src/core/index.js',
    output: [
        {
            file: 'dist/core/index.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'dist/core/index.cjs.js',
            format: 'cjs',
            sourcemap: true
        }
    ],
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        terser()
    ]
};

// Plugins bundle config
const pluginsConfig = {
    input: 'src/plugins/index.js',
    output: [
        {
            file: 'dist/plugins/index.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'dist/plugins/index.cjs.js',
            format: 'cjs',
            sourcemap: true
        }
    ],
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        terser()
    ]
};

// Utils bundle config
const utilsConfig = {
    input: 'src/utils/index.js',
    output: [
        {
            file: 'dist/utils/index.js',
            format: 'esm',
            sourcemap: true
        },
        {
            file: 'dist/utils/index.cjs.js',
            format: 'cjs',
            sourcemap: true
        }
    ],
    plugins: [
        nodeResolve({ browser: true }),
        commonjs(),
        terser()
    ]
};

export default [mainConfig, coreConfig, pluginsConfig, utilsConfig];