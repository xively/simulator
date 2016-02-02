'use strict';

module.exports = function(grunt) {
  grunt.config.set('clean', {
    public: {
      src: 'public',
    },
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
};
