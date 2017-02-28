/*



    Used only as an example for test1



*/
var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var MergeFilesPlugin = require('./index.js');

module.exports = {
    entry: {
        'entry1': './tests/test1/src/entry1/index.js',
        'entry2': './tests/test1/src/entry2/index.js'
    },
    output: {
        path: path.join(__dirname, './tests/test1/public'),
        filename: '[name].js'
    },
    module: {
        rules: [
            {
                use: ExtractTextPlugin.extract({
                    use: 'css-loader'
                }),
                test: /\.css$/,
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin({
            filename: '[name].style.css'
        }),
        new MergeFilesPlugin({
            filename: 'css/style.css',
            test: /style\.css/, // it could also be a string
            deleteSourceFiles: true
        })
    ]
}