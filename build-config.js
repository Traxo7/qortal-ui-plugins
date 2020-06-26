const babel = require('rollup-plugin-babel')
// const eslint = require('rollup-plugin-eslint')
const resolve = require('rollup-plugin-node-resolve')
const builtins = require('rollup-plugin-node-builtins')
const globals = require('rollup-plugin-node-globals')
const uglify = require('rollup-plugin-uglify').uglify
const commonjs = require('rollup-plugin-commonjs')
const progress = require('rollup-plugin-progress')
const path = require('path')
const alias = require('rollup-plugin-alias')

const aliases = {
    'qortal-ui-crypto': 'node_modules/qortal-ui-crypto/api.js'
}

const generateRollupConfig = (inputFile, outputFile) => {
    return {
        inputOptions: {
            onwarn: (warning, rollupWarn) => {
                if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                    rollupWarn(warning)
                }
            },
            input: inputFile,
            plugins: [
                alias({
                    // entries: {}
                    entries: Object.keys(aliases).map(find => {
                        return {
                            find,
                            replacement: aliases[find]
                        }
                    })
                }),
                resolve({
                    preferBuiltins: true,
                    mainFields: ['module', 'browser']
                }),
                commonjs({
                    // preferBuiltins: false,
                }),
                globals(),
                builtins(),
                // eslint(),
                progress(),
                babel({
                    exclude: 'node_modules/**'
                })
                // uglify() // only would work if babel is transpiling to es5
            ],
            // external: ['qortal-ui-crypto'],

            // context: 'self',
        },
        outputOptions: {
            // name: 'main', // for external calls (need exports)
            // file: 'dist/js/index.min.js',
            file: outputFile,
            format: 'umd', // was umd
            // plugins: pluginOptions,
            // name: 'worker'
        }
    }
}

const generateForPlugins = () => {
    const configs = [
        {
            in: 'plugins/core/main.src.js',
            out: 'plugins/core/main.js'
        },
        {
            in: 'plugins/core/send-money/send-money.src.js',
            out: 'plugins/core/send-money/send-money.js'
        },
        {
            in: 'plugins/core/wallet/wallet-app.src.js',
            out: 'plugins/core/wallet/wallet-app.js'
        },
        {
            in: 'plugins/core/reward-share/reward-share.src.js',
            out: 'plugins/core/reward-share/reward-share.js'
        },
        {
            in: 'plugins/core/node-management/node-management.src.js',
            out: 'plugins/core/node-management/node-management.js'
        },
        {
            in: 'plugins/core/group-management/group-management.src.js',
            out: 'plugins/core/group-management/group-management.js'
        },
        {
            in: 'plugins/core/group-management/group-transaction/group-transaction.src.js',
            out: 'plugins/core/group-management/group-transaction/group-transaction.js'
        },
        {
            in: 'plugins/core/name-registration/name-registration.src.js',
            out: 'plugins/core/name-registration/name-registration.js'
        },
        {
            in: 'plugins/core/messaging/messaging.src.js',
            out: 'plugins/core/messaging/messaging.js'
        },
        {
            in: 'plugins/core/messaging/chain-messaging/chain-messaging.src.js',
            out: 'plugins/core/messaging/chain-messaging/chain-messaging.js'
        },
        {
            in: 'plugins/core/messaging/q-chat/q-chat.src.js',
            out: 'plugins/core/messaging/q-chat/q-chat.js'
        },
    ].map(file => {
        return generateRollupConfig(path.join(__dirname, file.in), path.join(__dirname, file.out))
    })

    return configs
}
module.exports = generateForPlugins