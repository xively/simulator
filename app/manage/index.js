'use strict';

// Assign jQuery globally so angular uses it.
window.jQuery = window.$ = require('jquery');

var angular = require('angular');
require('angular-ui-router');
require('../vendor/jquery.qrcode-0.12.0.min.js');

var _ = require('lodash');

var commonModule = require('./pods/common');
var dashboardModule = require('./pods/dashboard');
var rulesListModule = require('./pods/rules-list');
var rulesFormModule = require('./pods/rules-form');
var deviceModule = require('./pods/device');
var deviceDetailsModule = require('./pods/device-details');
var settingsModule = require('./pods/settings');
var navModule = require('./pods/nav');

var concariaWebAppModule = angular.module('concaria-manage', [
  'ui.router',
  commonModule.name,
  dashboardModule.name,
  rulesListModule.name,
  rulesFormModule.name,
  deviceModule.name,
  deviceDetailsModule.name,
  settingsModule.name,
  navModule.name,
]);

concariaWebAppModule.service('automaticLoginInfo', ['applicationConfig', function(applicationConfig) {
  return {
    accountId: applicationConfig.accountId,
    emailAddress: applicationConfig.emailAddress,
    password: applicationConfig.password,
  };
}]);

concariaWebAppModule.config([
  '$urlRouterProvider',
  'applicationConfig',
  'AqiDataProvider',
  'BlueprintClientProvider',
  'BlueprintDevicesProvider',
  'LoginProvider',
  'MqttDeviceClientProvider',
  'TimeSeriesProvider',
  function(
    $urlRouterProvider,
    applicationConfig,
    AqiDataProvider,
    BlueprintClientProvider,
    BlueprintDevicesProvider,
    LoginProvider,
    MqttDeviceClientProvider,
    TimeSeriesProvider
  ) {

    $urlRouterProvider.otherwise('/dashboard');

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

    TimeSeriesProvider.options({
      host: _.result(applicationConfig, 'timeSeriesHost'),
      accountId: _.result(applicationConfig, 'accountId'),
      channelnamemap: _.get(applicationConfig, 'device.channelnamemap'),
    });

    MqttDeviceClientProvider.options({
      host: _.result(applicationConfig, 'brokerHost'),
      port: _.result(applicationConfig, 'brokerPort'),
      username: _.result(applicationConfig.user, 'username'),
      password: _.result(applicationConfig.user, 'password'),
    });

  },
]);
