'use strict';

var angular = require('angular');

var commonModule = require('../../common');
var mqttModule = require('../../mqtt');
var purifierSensorModule = require('../sensor');

var purifierDeviceController = require('./controller');
var purifierDeviceDirective = require('./directive');

var purifierDeviceModule = angular.module('purifier.device', [
  commonModule.name,
  mqttModule.name,
  purifierSensorModule.name,
]);

purifierDeviceModule.controller('purifierDeviceCtrl', purifierDeviceController);
purifierDeviceModule.directive('purifierDevice', purifierDeviceDirective);

module.exports = purifierDeviceModule;
