const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = (env, argv) => {
    let config = {
        entry: {
            main: ['@babel/polyfill', 'whatwg-fetch', path.resolve(__dirname, 'src/javascript/publicPath'), path.resolve(__dirname, 'src/javascript/ContentManagerApp.jsx')]
        },
        output: {
            path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
            filename: 'content-manager.js',
            chunkFilename: '[name].content-manager.[hash].js'
        },
        resolve: {
            mainFields: ['module', 'main'],
            extensions: ['.mjs', '.js', '.jsx', 'json']
        },
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: 'javascript/auto'
                },
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
                            'lodash'
                        ]
                    }
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
            new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|fr|de/)
        ],
        mode: 'development'
    };

    config.devtool = (argv.mode === 'production') ? 'source-map' : 'eval';

    if (argv.watch) {
        config.module.rules.push({
            exclude: /node_modules/,
            use: [
                {
                    loader: 'eslint-loader',
                    options: {
                        fix: true
                    }
                }
            ]
        });
    }

    if (argv.analyze) {
        config.devtool = 'source-map';
        config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
};
