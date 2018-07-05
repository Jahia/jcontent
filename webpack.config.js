const path = require('path');

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
            }
        ]
    },
    mode: 'development',
    devtool: 'source-map'
};