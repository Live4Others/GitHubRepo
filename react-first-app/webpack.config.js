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
        ]),
        new CopyWebpackPlugin([
            { from: 'src/lib', to: '../app/lib' }
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
        },{ 
            test: /\.(png|eot|ttf|svg)$/, 
            loader: 'url-loader?limit=100000' 
        }, { 
            test: /\.html$/, 
            loader: 'file?name=[name].[ext]' 
        }, { 
            test: /bootstrap\/dist\/js\/umd\//,
            loader: 'imports' 
        },{
            test: /\.(scss)$/,
            use: [{
              loader: 'style-loader', // inject CSS to page
            }, {
              loader: 'css-loader', // translates CSS into CommonJS modules
            }, {
              loader: 'postcss-loader', // Run post css actions
              options: {
                plugins: function () { // post css plugins, can be exported to postcss.config.js
                  return [
                    require('precss'),
                    require('autoprefixer')
                  ];
                }
              }
            }, {
              loader: 'sass-loader' // compiles Sass to CSS
            }]
        }]
    }
};
module.exports = config;