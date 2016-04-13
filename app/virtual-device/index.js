'use strict';

var _ = require('lodash');
window.jQuery = require('jquery');
var angular = require('angular');
require('angular-route');
require('angular-resource');
require('angular-ui-router');

var device = require('./pods/device');
var aqiModule = require('./pods/aqi');
var commonModule = require('./pods/common');
var mqttModule = require('./pods/mqtt');
var purifierModule = require('./pods/purifier');

var app = angular.module('concaria-virtual-device', [
  'ngRoute',
  'ngResource',
  'ui.router',
  device.name,
  aqiModule.name,
  commonModule.name,
  mqttModule.name,
  purifierModule.name,
]);

// Kickoff aqi module runtime.
app.run(['aqiService', function(aqiService) {
  aqiService.init();
}]);

// Automatically log us in when the app loads.
app.run([
  'Login',
  'applicationConfig',
  'mqttService',
  '$http',
  '$location',
  function(Login, applicationConfig, mqttService, $http, $location) {
    Login.renew()
      .catch(function() {
        return Login.login({
          accountId: applicationConfig.accountId,
          emailAddress: applicationConfig.emailAddress,
          password: applicationConfig.password,
        });
      });

    $http.get('api/firmware/' + $location.url().substr(1))
      .then(function(response) {
        mqttService.setProperties({
          host: applicationConfig.brokerHost,
          port: Number(applicationConfig.brokerPort),
          user: response.data.entityId,
          pw: response.data.secret
        });
      });
  },
]);

// Set up the app to run in HTML5 mode. This means that we support IE9+
app.config([
  '$stateProvider',
  '$urlRouterProvider',
  'applicationConfig',
  'AqiDataProvider',
  'BlueprintClientProvider',
  'BlueprintDevicesProvider',
  'LoginProvider',
  'mqttServiceProvider',
  function(
    $stateProvider,
    $urlRouterProvider,
    applicationConfig,
    AqiDataProvider,
    BlueprintClientProvider,
    BlueprintDevicesProvider,
    LoginProvider,
    mqttServiceProvider
  ) {
    $urlRouterProvider.otherwise('/devices');

    AqiDataProvider.options({
      apikey: applicationConfig.airnow.apikey,
      boundingbox: applicationConfig.airnow.boundingbox,
    });

    BlueprintClientProvider.options({
      accountId: _.result(applicationConfig, 'accountId'),
      host: _.result(applicationConfig, 'blueprintHost'),
    });

    BlueprintDevicesProvider.options({
      accountId: _.result(applicationConfig, 'accountId'),
      organizationId: _.result(applicationConfig, 'organizationId'),
    });

    LoginProvider.options({
      accountId: _.result(applicationConfig, 'accountId'),
      host: _.result(applicationConfig, 'idmHost'),
    });
  }]);
