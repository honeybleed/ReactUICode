const path = require('path');

module.exports = {
    entry: {
        ui: "./src/Components.js"
    },
    devtool: 'source-map',
    output: {
        path:path.resolve(__dirname, "./dist"),
        publicPath: "dist",
        filename: "[name].bundle.js"
    },
    mode:"development",
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets:[
                        "es2015",
                        "flow",
                        "react"
                    ]
                }
            },
            {
                test: /\.css$/,
                loaders: ["style-loader", "css-loader?modules&localIdentName=[local]"]
            },
            {
                test: /\.scss$/,
                loaders: ["style-loader", "css-loader?modules&localIdentName=[local]", "sass-loader"]
            },
            {
                test: /\.(woff|woff2|eot|svg|ttf)$/,
                loader: "url-loader",
                options: {
                    name: "[name].[ext]",
                    publicPath: "/dist/assets/",
                    fallback: "file-loader"
                }
            },
            {
                test: /\.(jpg|png|gif)$/,
                loader: "url-loader",
                options: {
                    limit: 8192,
                    name: "[name].[ext]",
                    publicPath: "/dist/assets/",
                    fallback: "file-loader"
                }
            }
        ]
    },
    resolve: {
        extensions: [ '.js', '.json', '.scss','.css'],
    },
    devServer: {
        contentBase: "./",
        historyApiFallback: true,
        inline: true,
        port: 8000
    }
};