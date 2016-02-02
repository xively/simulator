'use strict';

var angular = require('angular');

// Must have a different name to pass tests. purifer also has a common module.
var commonModule = angular.module('manage-common', []);

commonModule.constant('applicationConfig', require('./utils/application-config-constant'));

commonModule.controller('loginController', require('./login-controller'));
commonModule.directive('alert', require('./alert-directive'));
commonModule.directive('qrCode', require('./qr-code-directive'));
commonModule.directive('loader', require('./loader-directive'));
commonModule.directive('iphoneFrame', require('./iphone-frame-directive'));

// Providers for endpoints that use blueprint
/* Note: Providers are a subset of... providers (yeah they didn't do a good job naming that one)
   They preform their requests in the configuration phase of the project.
*/
commonModule.provider('AqiData', require('./aqi-data-provider'));
commonModule.provider('BlueprintClient', require('./blueprint-client-provider'));
commonModule.provider('BlueprintDevices', require('./blueprint-devices-provider'));
commonModule.provider('Login', require('./login-provider'));
commonModule.provider('MqttDeviceClient', require('./mqtt-device-client-provider'));
commonModule.provider('TimeSeries', require('./time-series-provider'));

// Factories for endpoints that don't require blueprint
/*
  Note:  The Factories are a subset of providers.
  They preform their requests in the application phase of the project.
  Factories are more common in typical angular projects.
*/
commonModule.factory('RulesData', require('./rules-data-factory'));

commonModule.value('aqiCategories', require('./utils/aqi-categories-value'));

module.exports = commonModule;
