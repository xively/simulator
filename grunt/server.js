'use strict';

module.exports = function(grunt) {
  grunt.registerTask('server', 'Start node server', function() {
    process.env.NODE_ENV = 'dev';
    require('../server/index');
  });
};
