'use strict';

module.exports = function(grunt) {
  grunt.config.set('sass_globbing', {
    your_target: {
      files: {
        'app/manage/assets/css/_pods.scss': 'app/manage/pods/**/*.scss',
      },
      options: {
        useSingleQuotes: false
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass-globbing');
};
