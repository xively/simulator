'use strict';

module.exports = function(grunt) {
  grunt.initConfig({});
  grunt.loadTasks('grunt');

  grunt.registerTask('build', [
    'test',
    'clean',
    'copy',
    'webpack:build',
    'sass_globbing',
    'sass:build',
    'postcss',
  ]);

  grunt.registerTask('dev', [
    'test',
    'clean',
    'copy',
    'webpack:dev',
    'sass_globbing',
    'sass:dev',
    'postcss',
    'server',
    'karma:watch:start',
    'watch',
  ]);

  grunt.registerTask('test', [
    'eslint',
    'karma:unit',
  ]);

  grunt.registerTask('default', ['dev']);

};
