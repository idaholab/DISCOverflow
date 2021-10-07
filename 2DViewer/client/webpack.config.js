// Copyright 2021, Battelle Energy Alliance, LLC
const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// to retrieve the explicit version numbers
const elkjsLatest = require('elkjs-latest/package.json');
const childProcess = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');
const globby = require('globby');

module.exports = async function (env) {
    if (!env) {
        env = {}
    }

    const buildRoot = path.resolve(__dirname, 'lib');
    const appRoot = path.resolve(__dirname, 'app');
    const monacoEditorPath = env.production ? 'node_modules/monaco-editor-core/min/vs' : 'node_modules/monaco-editor-core/dev/vs';
    const bootstrapDistPath = 'node_modules/bootstrap/dist';
    const jqueryDistPath = 'node_modules/jquery/dist';
    const autocompleteDistPath = 'node_modules/devbridge-autocomplete/dist';
    const sprottyCssPath = 'node_modules/sprotty/css';
    const elkWorkerPathLatest = 'node_modules/elkjs-latest/lib/elk-worker.js';
    const elkWorkerPathDefault = 'node_modules/elkjs/lib/elk-worker.js';

    const javaElkVersions = [ 'snapshot' ]; // latest snapshot/nightly at the time of building
    // Query released ELK versions using maven's REST API
    try {
        const response = await fetch("https://search.maven.org/solrsearch/select?q=g:%22org.eclipse.elk%22+AND+a:%22org.eclipse.elk.core%22&core=gav&wt=json")
                                    .then(res => res.json());
        response.response.docs.forEach(doc => {
            javaElkVersions.push(doc.v);
        });
    } catch (error) {
        console.error("Unable to retrieve ELK releases, only the latest will be available (" + error.message + ").");
    }
    const javaElkVersionsOptions = javaElkVersions
                                     .map(version => `<option value="${version}">${version}</option>`)
                                     .join("");

    const rules = [
        {
            test: /node_modules[\\|/](vscode-languageserver-types|vscode-uri|jsonc-parser)/,
            use: { loader: 'umd-compat-loader' }
        },
        {
            test: /\.elkt$/,
            use: { loader: path.resolve('./lib/examples/elkex-loader.js') }
        },
    ];
    if (env.production) {
        rules.push({
            test: /.*\/app\/.*\.js$/,
            exclude: /node_modules[\\|/](vscode-base-languageclient|vscode-languageserver-protocol|vscode-languageserver-types|vscode-uri|snabbdom|reconnecting-websocket)/,
            loader: 'uglify-loader'
        });
    } else {
        rules.push({
            test: /\.js$/,
            enforce: 'pre',
            loader: 'source-map-loader'
        });
    }

    return {
        entry: {
            cfg: path.resolve(buildRoot, 'main'),
        },
        mode: env.production ? 'production' : 'development',
        output: {
            filename: '[name].bundle.js',
            path: appRoot
        },
        target: 'web',
        module: { rules },
        resolve: {
            extensions: ['.js'],
            alias: {
                'vs': path.resolve(__dirname, monacoEditorPath),
                'vscode': require.resolve('monaco-languageclient/lib/vscode-compatibility')
            }
        },
        devtool: 'source-map',
        plugins: [
            new CopyWebpackPlugin({
                patterns: [
                    { from: bootstrapDistPath, to: 'bootstrap' }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    { from: jqueryDistPath, to: 'jquery' }
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {from: autocompleteDistPath, to: 'jquery-autocomplete'}
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {from: sprottyCssPath, to: 'sprotty'}
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {from: elkWorkerPathLatest, to: 'elk-latest'}
                ]
            }),
            new CopyWebpackPlugin({
                patterns: [
                    {from: elkWorkerPathLatest, to: 'elk'}
                ]
            })
        ]
    }
}
