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
      src: 'img/*',
      dest: 'public/virtual-device/'
    },

    landing: {
      expand: true,
      cwd: 'app/landing/assets/',
      dest: 'public/landing/',
      src: 'img/*',
    },

    fonts: {
      expand: true,
      cwd: './node_modules/font-awesome/',
      src: 'fonts/*',
      dest: 'public/manage/'
    },

    vdFonts: {
      expand: true,
      cwd: 'app/virtual-device/assets/',
      src: 'fonts/*',
      dest: 'public/virtual-device/'
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
};
