const path = require('path');

module.exports = {
    target: "electron-main",
    entry: {
        main: "./src/oct-agent/main.js"
    },
    devtool: 'source-map',
    output: {
        path:path.join(__dirname, "dist/oct-agent/"),
        filename: "[name].js"
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
        contentBase: "dist/oct-agent/",
        historyApiFallback: true,
        proxy: {
            '/': {
                target: 'http://10.11.51.101:8008/',
                changeOrigin: true,
                secure: false
            }
        }
    }
};