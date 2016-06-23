var webpackConfig = require('./webpack.config')
var _ = require('lodash')

webpackConfig = _.merge(webpackConfig, {
  devtool: 'inline-source-map',
  cache: true,
  module: {
    postLoaders: [{
      test: /\.js$/,
      exclude: /(spec|vendor|node_modules)/,
      loader: 'istanbul-instrumenter'
    }]
  }
})

webpackConfig.entry = undefined
webpackConfig.plugins = []

module.exports = function (config) {
  config.set({
    basePath: './client/app',
    files: [
       './common/test.globals.js',
      '../../node_modules/babel-polyfill/dist/polyfill.js',
      'test.webpack.js',
      './**/*spec.js'
    ],

    exclude: [
      '*.html'
    ],

    // frameworks to use
    frameworks: ['mocha', 'sinon-chai'],

    preprocessors: {
      'test.webpack.js': ['webpack', 'sourcemap'],
      './**/*spec.js': ['webpack', 'sourcemap']
    },

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      type: 'html',
      dir: '../../coverage/'
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true
    },

    plugins: [
      require('istanbul-instrumenter-loader'),
      require('karma-webpack'),
      require('karma-mocha'),
      require('karma-sinon'),
      require('karma-sinon-chai'),
      require('karma-coverage'),
      require('karma-phantomjs-launcher'),
      require('karma-spec-reporter'),
      require('karma-sourcemap-loader')
    ],

    browsers: ['PhantomJS']
  })
}
