var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');

// creating the dist folder here
var DIST_DIR = path.resolve(__dirname, "dist");
var SRC_DIR = path.resolve(__dirname, "src");

var config = {
    node: {
        fs: "empty"
    },
    mode: "development",
    entry: SRC_DIR + "/app/index.js",
    output: {
        path: DIST_DIR + "/app",
        filename: "bundle.js",
        publicPath: "/app"
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: 'src/index.html', to: '../app/index.html' }
        ]),
        new CopyWebpackPlugin([
            { from: 'src/css/sticky-footer-navbar.css', to: '../app/css/sticky-footer-navbar.css' }
        ]),
        new CopyWebpackPlugin([
            { from: 'src/img/back.png', to: '../app/img/back.png' }
        ]),
        new CopyWebpackPlugin([
            { from: 'src/img/loading.gif', to: '../app/img/loading.gif' }
        ]),
        new CopyWebpackPlugin([
            { from: 'src/environments.json', to: '../app/environments.json' }
        ])
    ],
    module: {
        rules: [{
            test: /\.js?/,
            include: SRC_DIR,
            loader: "babel-loader",
            query: {
                presets: ["es2015", "react", "stage-2"]
            }
        },{
            test: /(\.css|\.scss)$/,
            use: [ 'style-loader', 'css-loader' , 'sass-loader']
        },{ test: /\.(png|eot|ttf|svg)$/, 
            loader: 'url-loader?limit=100000' 
        }]
    }
};

module.exports = config;