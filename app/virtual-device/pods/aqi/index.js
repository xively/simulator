'use strict';

var angular = require('angular');

var aqiCtrl = require('./aqi-controller');
var aqiService = require('./aqi-service-factory');
var aqiResource = require('./aqi-resource-factory');
var aqiCategories = require('../../../manage/pods/common/utils/aqi-categories-value');
var AqiData = require('../../../manage/pods/common/aqi-data-provider');

// The AQI module manages the AQI rating within the interface
var aqiModule = angular.module('aqi', ['ngResource']);

aqiModule.controller('aqiCtrl', aqiCtrl);
aqiModule.factory('aqiService', aqiService);
aqiModule.factory('aqiResource', aqiResource);
aqiModule.provider('AqiData', AqiData);
aqiModule.value('aqiCategories', aqiCategories);

module.exports = aqiModule;
