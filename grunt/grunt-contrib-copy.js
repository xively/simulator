'use strict';

module.exports = function(grunt) {
  grunt.config.set('copy', {
    manage: {
      expand: true,
      dest: 'public/manage/img',
      src: 'app/manage/**/assets/img/*',
      flatten: true
    },

    virtualDevice: {
      expand: true,
      cwd: 'app/virtual-device/assets/',
      dest: 'public/virtual-device/',
      src: 'img/*',
    },

    fonts: {
      expand: true,
      cwd: './node_modules/font-awesome/',
      src: 'fonts/*',
      dest: 'public/manage/'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
