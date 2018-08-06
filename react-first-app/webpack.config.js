var path = require("path");
var CopyWebpackPlugin = require('copy-webpack-plugin');

// creating the dist folder here
var DIST_DIR = path.resolve(__dirname, "dist");
var SRC_DIR = path.resolve(__dirname, "src");

var config = {
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
        ])
    ],
    module: {
        rules: [{
            test: /\.js?/,
            include: SRC_DIR,
           // exclude: SRC_DIR + '/node_modules',
            loader: "babel-loader",
            query: {
                presets: ["es2015", "react", "stage-2"]
            }
        },{
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        }]
    }
};

module.exports = config;