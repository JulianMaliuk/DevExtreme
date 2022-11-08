import peerDepsExternal from 'rollup-plugin-peer-deps-external';
// import typescript from 'rollup-plugin-typescript2';
import typescript from "@rollup/plugin-typescript";
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';

function checkExternalPackage(id) {
    return ['@devexpress'].includes(id.split('/')[0]);
}

function getEsmConfig(componentName, outputDir) {
    const inputPath = `tsc-out/components/${componentName}/index.js`;

    return {
        input: inputPath,
        output: {
            dir: `${outputDir}/esm`,
            entryFileNames: '[name].js',
            format: 'esm',
            sourcemap: true,
            exports: 'named',
            preserveModules: true,
            preserveModulesRoot: 'src',
        },
        plugins: [
            copy({
                targets: [
                    { src: 'src/**/*.scss', dest: 'tsc-out' }
                ],
                flatten: false
            }),
            peerDepsExternal(),
            // typescript({
            //     tsconfig: './tsconfig.package.json',
            //     compilerOptions: {
            //         outDir: `${outputDir}/esm`,
            //         module: 'NodeNext',
            //     }
            // }),
            postcss({
                extract: `${componentName}.css`,
            })
        ],
        external: checkExternalPackage,
    }
}

function getCjsConfig(componentName, outputDir) {
    const inputPath = `tsc-out/components/${componentName}/index.js`;

    return {
        input: inputPath,
        output: {
            dir: `${outputDir}/cjs`,
            entryFileNames: '[name].cjs',
            format: 'cjs',
            sourcemap: true,
            exports: 'named',
            preserveModules: true,
            preserveModulesRoot: 'src',
        },
        plugins: [

            peerDepsExternal(),
            // typescript({
            //     tsconfig: './tsconfig.package.json',
            //     compilerOptions: {
            //         outDir: `${outputDir}/cjs`,
            //         module: 'NodeNext',
            //         moduleResolution: 'NodeNext',
            //     }
            // }),
            postcss({
                inject: false,
                extract: false,
            }),
        ],
        external: checkExternalPackage,
    };
}

function getRootConfig(outputDir) {
    return {
        input: './src/index.ts',
        output: {
            dir: `${outputDir}/esm`,
            format: 'esm',
            preserveModules: true,
            preserveModulesRoot: 'src',
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.package.json',
                compilerOptions: {
                    outDir: `${outputDir}/esm`,
                    module: 'NodeNext',
                    moduleResolution: 'NodeNext',
                }
            }),
            postcss({
                inject: false,
                extract: false,
            }),

        ],
        external: checkExternalPackage,
    };
}

function getRollupConfig(components, outputPath) {
    return [
        ...components.map((componentName) => getEsmConfig(componentName, outputPath)),
        ...components.map((componentName) => getCjsConfig(componentName, outputPath)),
        // getRootConfig(outputPath),
    ];
}

export {
    getEsmConfig,
    getCjsConfig,
    getRootConfig,
    getRollupConfig,
}
