/* ************************************************************************
 *  <copyright file="webpack.config.js" company="hyting">
 *  Copyright (c) 2010, 2016 All Right Reserved, http://www.yantinghu.com
 *
 *  THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 *  KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 *  IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 *  PARTICULAR PURPOSE.
 *  </copyright>
 *  ***********************************************************************/

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const autoprefixer = require('autoprefixer');
const path = require('path');
const loadersPath = path.join(__dirname, 'loaders');
const publicPath = path.join(__dirname, './app');
const nodeModulePath = path.join(__dirname, 'node_modules');
const outputPath = path.join(publicPath, 'dist');
const assetsPath = path.join(publicPath, 'assets');
const pagesPath = path.join(assetsPath, 'pages');
const coreAssetsPath = path.join(assetsPath, 'core');
const config = require('./app/version.json');
const nodeEnv = process.env.NODE_ENV || 'dev';

let preLoaders = [{ loader: 'pre_js_loader' }];
if (nodeEnv == 'dev') {
    preLoaders = [{ loader: 'eslint-loader' }, { loader: 'pre_js_loader' }];
}

module.exports = {
    context: assetsPath,
    entry: {
        'app': ['./pages/app'],
        '3rdParty.vendor': [
            'babel-polyfill',
            'jquery'
        ]
    },
    // devtool: '#@source-map',
    output: {
        path: outputPath,
        publicPath: '',
        filename: 'js/' + '[name]-' + config.version + '.js',
        chunkFilename: "[id].js"
    },
    module: {
        /* 这里的 sass-loader 中 'css-loader' 必须写在最前面，表示作为最后一个加载项 */
        rules: [
            { test: /\.css$/, loader: ExtractTextPlugin.extract({ use: [
                // { loader: 'style-loader' },
                { loader: 'css-loader' }
            ] }) },
            { test: /\.scss$/, loader: ExtractTextPlugin.extract({ use: [
                // { loader: 'style-loader' },
                { loader: 'css-loader' },
                { loader: 'postcss-loader',
                    options: {
                        plugins: () => ([
                          require('precss'),
                          require('autoprefixer')
                        ])
                    }
                },
                { loader: 'sass-loader' }
            ] }) },
            { test: /\.js$/, enforce: "pre", use: preLoaders, exclude: /node_modules/ },
            { test: /\.js$/, loader: 'babel-loader', exclude: /node_modules/, query: { presets: ['es2015', 'stage-0'] } },
            { test: /\.json$/, loader: 'hjson-loader' },
            { test: /\.(png|woff(2)?|eot|ttf|svg)$/, loader: 'url-loader?limit=100000' },
            { test: /\.jpg$/, loader: 'file-loader' },
            { test: /\.html$/, loader: 'html' },
            { test: /\.tpl$/, loader: 'string-loader' }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
            $utils: '$$utils',
            $application: '$$application',
            $commonConfigs: '$$commonConfigs'
        }),
        new webpack.DefinePlugin({
            VERSION: '1.0',
            DEBUG: nodeEnv != 'prod' //根据系统平台，开发环境为mac/windows，部署环境为linux
        }),
        new webpack.optimize.CommonsChunkPlugin({
            name: ['3rdParty.vendor'],
            filename: 'js/' + '[name]-' + config.version + '.js',
            minChunks: Infinity
        }),
        new ExtractTextPlugin('css/' + '[name]-' + config.version + '.css')
    ],
    resolve: {
        modules: [pagesPath, coreAssetsPath, nodeModulePath],
        extensions: ['.js']
    },
    resolveLoader: {
        modules: [loadersPath, nodeModulePath]
    }
};
