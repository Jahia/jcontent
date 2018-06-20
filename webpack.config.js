const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/javascript', 'ContentManagerApp.jsx'),
    output: {
        path: path.resolve(__dirname, 'src/main/resources/javascript/apps/'),
        filename: 'content-manager.js'
    },
    resolve: {
        mainFields: ['main'],
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [path.join(__dirname, "src")],
                loader: 'babel-loader',

                query: {
                    presets: ['env', 'react', 'stage-2'],
                    plugins: [
                        "lodash",
                        ["direct-import", [
                            "@material-ui/core",
                            "@material-ui/icons",
                            "react-i18next"
                        ]]
                    ]
                }
            }
        ]
    },
    mode: 'development',
    devtool: 'source-map'
};