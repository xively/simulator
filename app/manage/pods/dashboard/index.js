'use strict';

var angular = require('angular');
require('angular-ui-router');

var resolveArgs = require('../common/utils/resolve-args');

var commonModule = require('../common');
var deviceModule = require('../device');

var dashboardModule = angular.module('dashboard', [
  'ui.router',
  commonModule.name,
  deviceModule.name,
]);

dashboardModule.directive('dashboardCell', require('./dashboard-cell-directive'));

dashboardModule.service('dashboardLocations', require('./dashboard-locations-service'));

dashboardModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('dashboard', {
        url: '/dashboard',
        template: require('./template.tmpl'),
        controller: [
          '$scope',
          'dashboardLocations',
          'BlueprintDevices',
          resolveArgs({$scopeIndex: 0, indices: [1, 2]}, function($scope, locations, devices) {
            $scope.devices = devices;
            $scope.locations = locations;
          }),
        ],
      });
  },
]);

module.exports = dashboardModule;
