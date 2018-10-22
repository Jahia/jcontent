const path = require('path');
const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');


module.exports = {
    entry: path.resolve(__dirname, 'src/javascript', 'ContentManagerApp.jsx'),
    output: {
        path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
        filename: 'content-manager.js'
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
                type: "javascript/auto",
            },
            {
                test: /\.jsx?$/,
                include: [path.join(__dirname, "src")],
                loader: 'babel-loader',

                query: {
                    presets: [['env', {modules: false}], 'react', 'stage-2'],
                    plugins: [
                        "lodash"
                    ]
                }
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [{
                    loader: 'file-loader',
                    options: {
                        name: '[name].[ext]',
                        outputPath: '__dx_module_path__/fonts/'
                    }
                }]
            },
        ],
    },
    plugins: [
        //new BundleAnalyzerPlugin({analyzerMode: "static"}),
        new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /en|fr|de/),
        // replace __dx_module_path__ to __webpack_public_path__ variable (set in template jsp file)
        new ReplaceInFileWebpackPlugin([{
            dir: 'src/main/resources/javascript/apps/',
            test:/\.js$/,
            rules: [{
                search: /__dx_module_path__/g,
                replace: '" + __webpack_public_path__ +"'
            }]
        }])
    ],
    mode: 'development',
    devtool: 'source-map'
};