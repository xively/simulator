'use strict';

module.exports = function(grunt) {
  grunt.config.set('eslint', {
    options: {
      configFile: 'server/.eslintrc',
    },
    build: {
      src: [
        'Gruntfile.js',
        'grunt/**/*.js',
      ],
    },

    app: {
      options: {
        configFile: 'app/.eslintrc',
      },
      src: [
        'app/**/*.js',
        '!app/manage/vendor/**/*.js',
        '!app/vendor/**/*.js',
      ],
    },

    server: {
      src: [
        'server/**/*.js',
        'provision/*.js',
        '!server/vendor/**/*',
      ],
    },

    bin: {
      src: [
        './bin/**/*'
      ]
    },

    test: {
      options: {
        configFile: 'tests/.eslintrc',
      },
      src: [
        'tests/**/*.js',
      ],
    },
  });

  grunt.loadNpmTasks('grunt-eslint');
};
