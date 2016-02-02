'use strict';

module.exports = function(grunt) {
  grunt.config.set('postcss', {
    options: {
      processors: [
        require('autoprefixer')({browsers: 'last 2 versions, ie >= 10'}),
      ],
    },
    css: {
      src: 'public/**/*.css',
    },
  });

  grunt.loadNpmTasks('grunt-postcss');
};
