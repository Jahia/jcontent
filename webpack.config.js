const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const shared = require("./webpack.shared")
const moonstone = require("@jahia/moonstone/dist/rulesconfig-wp");

module.exports = (env, argv) => {
    let config = {
        entry: {
            main: path.resolve(__dirname, 'src/javascript/index')
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'jcontent.bundle.js',
            chunkFilename: '[name].jcontent.[chunkhash:6].js'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', '.json', '.scss'],
            alias: {
                '~': path.resolve(__dirname, './src/javascript'),
            },
            fallback: { "url": false }
        },
        module: {
            rules: [
                ...moonstone,
                {
                    test: /\.m?js$/,
                    type: 'javascript/auto'
                },
                {
                    test: /\.jsx?$/,
                    include: [path.join(__dirname, 'src')],
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    modules: false,
                                    targets: {chrome: '60', edge: '44', firefox: '54', safari: '12'}
                                }],
                                '@babel/preset-react'
                            ],
                            plugins: [
                                'lodash',
                                '@babel/plugin-syntax-dynamic-import'
                            ]
                        }
                    }
                },
                {
                    test: /\.css$/,
                    include: [path.join(__dirname,'node_modules/react-image-crop')],
                    sideEffects: true,
                    use: ['style-loader', 'css-loader']
                },
                {
                    test: /\.scss$/i,
                    include: [path.join(__dirname, 'src')],
                    sideEffects: true,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                attributes: {
                                    styleloader: true
                                }
                            }
                        },
                        // Translates CSS into CommonJS
                        {
                            loader: 'css-loader',
                            options: {
                                modules: {
                                    mode: 'local',
                                    localIdentName: "[path][name]__[local]--[hash:base64:5]",
                                }
                            }
                        },
                        // Compiles Sass to CSS
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/'
                        }
                    }]
                }
            ]
        },
        plugins: [
            new ModuleFederationPlugin({
                name: "jcontent",
                library: { type: "assign", name: "appShell.remotes.jcontent" },
                filename: "remoteEntry.js",
                exposes: {
                    './init': './src/javascript/init',
                    './JContent/actions': './src/javascript/JContent/actions/index'
                },
                remotes: {
                    '@jahia/app-shell': 'appShellRemote',
                    '@jahia/jahia-ui-root': 'appShell.remotes.jahiaUi'
                },
                shared
            }),
            new CleanWebpackPlugin(path.resolve(__dirname, 'src/main/resources/javascript/apps/'), {verbose: false}),
            new CopyWebpackPlugin({patterns: [{from: './package.json', to: ''}]}),
            new CaseSensitivePathsPlugin()
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval-source-map';

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
