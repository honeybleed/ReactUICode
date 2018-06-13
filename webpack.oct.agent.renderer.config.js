const path = require('path');
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    target: "electron-renderer",
    entry: {
        agent: "./src/oct-agent/index.js"
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
    },
    plugins: [
        new HtmlWebpackPlugin({
            title:"oct agent",
            template:"./src/oct-agent/index.html",
            filename:"index.html",
            inject: "body"
        }),
        new CopyWebpackPlugin([
            {from:'./src/oct-agent/public-package.json', to:'./package.json'},
            './src/oct-agent/logoBlack.png',
            './src/oct-agent/icon.ico',
        ])
    ]
};