'use strict'

const path = require('path')

const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LessPluginCleanCSS = require('less-plugin-clean-css')
const LessPluginAutoPrefix = require('less-plugin-autoprefix')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const SplitByPathPlugin = require('webpack-split-by-path')

const isProduction = process.env.NODE_ENV === 'production'

const ROOT_FOLDER = path.resolve(__dirname)
const SRC_FOLDER = path.join(ROOT_FOLDER, 'client')
const CONFIG_FOLDER = path.join(ROOT_FOLDER, 'config')
const DIST_FOLDER = path.join(ROOT_FOLDER, 'public')

const entry = {
  app: ['babel-polyfill', path.join(SRC_FOLDER, 'app/index.js')]
}

const plugins = [
  new HtmlWebpackPlugin({
    inject: 'head',
    template: path.join(SRC_FOLDER, 'index.html')
  }),

  new webpack.NoErrorsPlugin(),

  // env
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': `${process.env.NODE_ENV}`
  }),

  new SplitByPathPlugin([{
    name: 'vendors',
    path: path.join(`${__dirname}/../node_modules`)
  }]),

  new ExtractTextPlugin(isProduction ? 'style/[name].[chunkhash].css' : 'style/[name].css')
]

if (isProduction) {
  plugins.push(new webpack.optimize.UglifyJsPlugin({ minimize: true }))
}

const webpackConfig = {
  devtool: 'source-map',
  entry: entry,
  output: {
    publicPath: '/', // This is used for generated urls
    path: DIST_FOLDER,
    filename: isProduction ? 'script/[name].[chunkhash].js' : 'script/[name].js',
    chunkFilename: isProduction ? 'script/[name].[chunkhash].js' : 'script/[name].js'
  },
  plugins: plugins,
  resolve: {
    alias: {
      'xively-client': path.join(ROOT_FOLDER, 'client/vendor/xively-client')
    }
  },
  resolveLoader: {
    fallback: path.join(ROOT_FOLDER, 'node_modules')
  },
  lessLoader: {
    lessPlugins: [
      new LessPluginAutoPrefix({ browsers: ['last 2 versions'] }),
      new LessPluginCleanCSS({ advanced: true })
    ]
  },
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['ng-annotate', 'babel'],
      exclude: /node_modules/,
      include: [SRC_FOLDER, CONFIG_FOLDER]
    }, {
      test: /(\.less$|\.css$)/,
      loader: ExtractTextPlugin.extract('style-loader', 'css-loader?sourceMap!less-loader?sourceMap')
    }, {
      test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'
    }, {
      test: /\.svg$/,
      loader: 'svg-inline'
    }, {
      test: /\.html$/,
      loader: 'html'
    }]
  }
}

module.exports = webpackConfig
