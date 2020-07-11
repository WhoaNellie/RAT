require('path');

module.exports = {
    mode: 'development',
    entry: './script.ts',
    output: {
        filename: "script.js",
    },
    module: {
        rules: [
            {
                test: /\.ts|\.js$/,
                loader: 'ts-loader',
                exclude: /node_modules/
            },
        ]
    },
    devServer: {
        contentBase: __dirname,
        watchContentBase: true,
        publicPath: '/dist/',
        port: 3000
    },
    resolve: {
        extensions: ['.ts', '.js', '.json']
    }
}