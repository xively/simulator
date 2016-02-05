'use strict';

module.exports = function(grunt) {
  grunt.config.set('watch', {
    livereload: {
      options: {
        livereload: true,
      },
      files: ['public/**/*'],
      tasks: [],
    },
    build: {
      files: '<%= eslint.build.src %>',
      tasks: ['eslint:build'],
    },
    app: {
      files: '<%= eslint.app.src %>',
      tasks: ['eslint:app', 'karma:watch:run'],
    },
    server: {
      files: '<%= eslint.server.src %>',
      tasks: ['eslint:server'],
    },
    test: {
      files: '<%= eslint.test.src %>',
      tasks: ['eslint:test', 'karma:watch:run'],
    },
    sass: {
      files: ['app/virtual-device/**/*.scss', 'app/manage/**/*.scss', 'app/landing/**/*.scss'],
      tasks: ['sass:dev', 'postcss:css'],
    },
    copy: {
      files: ['<%= copy.manage.src =>', '<%= copy.virtualDevice.src =>'],
      tasks: ['copy'],
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
};

