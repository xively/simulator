'use strict';

var webpackConfig = require('../webpack.config.js');

module.exports = function(grunt) {
  var webpack = require('webpack');

  grunt.config.set('webpack', {
    options: webpackConfig,
    build: {
      resolve: {
        extensions: ['', '.min.js', '.js'],
      },
      plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
      ],
    },
    dev: {
      watch: true,
      debug: true,
    },
  });

  grunt.loadNpmTasks('grunt-webpack');
};
