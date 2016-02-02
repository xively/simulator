'use strict';

var angular = require('angular');

var navModule = angular.module('concariaNav', []);

navModule.directive('navBar', require('./nav-bar-directive'));
navModule.directive('navBarItem', require('./nav-bar-item-directive'));
navModule.directive('navContent', require('./nav-content-directive'));
navModule.directive('navMenu', require('./nav-menu-directive'));
navModule.directive('navTitle', require('./nav-title-directive'));

module.exports = navModule;
