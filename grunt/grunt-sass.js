'use strict';

module.exports = function(grunt) {
  grunt.config.set('sass', {
    dev: {
      options: {
        sourceMap: true,
      },
      files: {
        'public/virtual-device/css/main.css': [
          'app/virtual-device/assets/css/main.scss',
        ],
        'public/manage/css/main.css': [
          'app/manage/assets/css/main.scss',
        ],
      },
    },
    build: {
      options: {
        outputStyle: 'compressed',
      },
      files: '<%= sass.dev.files %>',
    },
  });

  grunt.loadNpmTasks('grunt-sass');
};
