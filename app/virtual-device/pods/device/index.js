'use strict';

var angular = require('angular');
var routes = require('./routes');
var blueprintDevices = require('../../../manage/pods/common/blueprint-devices-provider');

var device = angular.module('deviceDetails', []);
device.provider('BlueprintDevices', blueprintDevices);

device.config(routes);

module.exports = device;
