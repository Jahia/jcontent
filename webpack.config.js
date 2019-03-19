const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Get manifest
var normalizedPath = require('path').join(__dirname, './target/dependency');
var manifest = '';
require('fs').readdirSync(normalizedPath).forEach(function (file) {
    manifest = './target/dependency/' + file;
    console.log('use manifest ' + manifest);
});

module.exports = (env, argv) => {
    let config = {
        entry: {
            main: ['whatwg-fetch', path.resolve(__dirname, 'src/javascript/publicPath'), path.resolve(__dirname, 'src/javascript/ContentManagerApp.loader')]
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'cmm.bundle.js',
            chunkFilename: '[name].cmm.[chunkhash:6].js'
        },
        // BACKLOG-9616 : fix chunks
        // optimization: {
        //     splitChunks: {
        //         maxSize: 4000000
        //     }
        // },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json']
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    loader: 'babel-loader',
                    query: {
                        presets: [
                            ['@babel/preset-env', {modules: false, targets: {safari: '7', ie: '10'}}],
                            '@babel/preset-react'
                        ],
                        plugins: [
                            'lodash',
                            '@babel/plugin-syntax-dynamic-import'
                        ]
                    }
                },
                {
                    test: /\.css$/,
                    use: ['style-loader', 'css-loader']
                }
            ]
        },
        plugins: [
            new webpack.DllReferencePlugin({
                manifest: require(manifest)
            }),
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|fr|de/),
            new CleanWebpackPlugin(path.resolve(__dirname, 'src/main/resources/javascript/apps/'), {verbose: false}),
            new webpack.HashedModuleIdsPlugin({
                hashFunction: 'sha256',
                hashDigest: 'hex',
                hashDigestLength: 20
            }),
            new CopyWebpackPlugin([{from: './package.json', to: ''}])
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.watch) {
        config.module.rules.push({
            test: /\.jsx?$/,
            include: [path.join(__dirname, 'src')],
            exclude: /node_modules/,
            enforce: 'pre',
            loader: 'eslint-loader',
            options: {
                quiet: true,
                fix: true
            }
        });
    }

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
