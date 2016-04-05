'use strict';

var angular = require('angular');
require('angular-ui-router');

var commonModule = require('../common');
var deviceListModule = require('../device-list');
var deviceDetailsModule = require('../device-details');
var deviceModule = angular.module('concaria-manage-device', [
  'ui.router',
  commonModule.name,
  deviceListModule.name,
  deviceDetailsModule.name,
]);

deviceModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('device', {
        abstract: true,
        template: require('./template.tmpl'),
        resolve: {
          deviceMqtt: 'MqttDeviceClient',
        },
      });
  },
]);

module.exports = deviceModule;
