'use strict';

var angular = require('angular');

var purifierControlsDirective = require('./purifier-controls/directive');
var purifierDeviceModule = require('./purifier-device');
var purifierInfoDirective = require('./purifier-info/directive');
var purifierMainDirective = require('./purifier-main/directive');
var purifierModeBarDirective = require('./purifier-mode-bar/directive');
var purifierSensorModule = require('./sensor');

var purifierDirectives = angular.module('purifier.directives', []);
purifierDirectives.directive('purifierControls', purifierControlsDirective);
purifierDirectives.directive('purifierInfo', purifierInfoDirective);
purifierDirectives.directive('purifierMain', purifierMainDirective);
purifierDirectives.directive('purifierModeBar', purifierModeBarDirective);

// This is the main module. It's for the visualiation of what the
// device is registering.
var purifierModule = angular.module('purifier', [
  purifierDeviceModule.name,
  purifierDirectives.name,
  purifierSensorModule.name
]);

module.exports = purifierModule;
