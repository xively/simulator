'use strict';

module.exports = function(grunt) {
  grunt.config.set('karma', {
    options: {
      configFile: 'karma.conf.js',
    },
    unit: {},
    watch: {
      background: true,
      singleRun: false,
    },
  });

  grunt.loadNpmTasks('grunt-karma');
};
