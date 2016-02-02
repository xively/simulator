'use strict';

var _ = require('lodash');
var angular = require('angular');
require('angular-ui-router');

var resolveArgs = require('../common/utils/resolve-args');

var deviceListModule = angular.module('concaria-manage-device-list', ['ui.router']);

deviceListModule.directive('sortableHeader', require('./sortable-table-header-directive'));

deviceListModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('device.list', {
        url: '/devices?sortBy&{sortDesc:bool}',
        params: {
          sortBy: {
            value: 'name',
            squash: true,
          },
          sortDesc: {
            value: false,
            squash: true,
          },
        },
        reloadOnSearch: false,
        template: require('./template.tmpl'),
        controller: [
          '$scope', '$state', '$stateParams', 'BlueprintDevices', 'deviceMqtt',
          resolveArgs({$scopeIndex: 0, indices: [3]}, function(
            $scope, $state, $stateParams, devices, deviceMqtt
          ) {
            // Table column data used in the template.
            $scope.columns = [
              {title: 'Name', sortBy: 'name', classSuffix: 'name'},
              {title: 'Type', sortBy: 'templateName', classSuffix: 'type'},
              {title: 'Provisioning Status', sortBy: 'provisioningState', classSuffix: 'provisioning'},
              {title: 'Location', sortBy: 'organizationName', classSuffix: 'location'},
              {title: 'Connection Status', sortBy: 'connectionStatus', classSuffix: 'connection'},
              {title: 'State', sortBy: 'sensor.fanRaw', classSuffix: 'state'},
              {title: 'Alert', sortBy: 'sensor.filterRaw', classSuffix: 'alert'},
            ];
            // Sorting options.
            $scope.sortBy = $stateParams.sortBy;
            $scope.sortDesc = $stateParams.sortDesc;
            // Combined sortBy/sortDesc used by select control.
            Object.defineProperty($scope, 'sortByDesc', {
              get: function() {
                return $scope.sortBy + ',' + Number($scope.sortDesc);
              },
              set: function(value) {
                var parts = value.split(',');
                $scope.sortBy = parts[0];
                $scope.sortDesc = parts[1] === '1';
              },
            });
            // The sortBy/sortDesc select control was changed.
            $scope.sortSelectChange = function() {
              $state.go('.', {
                sortBy: $scope.sortBy,
                sortDesc: $scope.sortDesc,
              });
            };
            // A table header was clicked.
            $scope.sortHeaderClick = function(params) {
              if (params.sortBy) {
                params.sortDesc = false;
                $scope.sortBy = params.sortBy;
              }
              $scope.sortDesc = params.sortDesc;
              $state.go('.', params);
            };
            // Load specific device details page.
            $scope.showDevice = function(device) {
              $state.go('device.details', {deviceId: device.id});
            };
            // Attach deep copy of devices array to scope for the view to use.
            $scope.devices = _.cloneDeep(devices);
            // When relevant mqtt data is recieved, update device objects.
            $scope.devices.forEach(function(device) {
              // Get the device's sensor channel.
              var sensorChannel = _.find(device.channels, 'channelTemplateName', 'sensor').channel;
              // Any mqtt sensor data will be stored on this object.
              device.sensor = {};
              // Subscribe to mqtt sensor changes.
              deviceMqtt.subscribe({
                topic: sensorChannel,
                group: 'device-list',
                sensor: 'fan',
                $scope: $scope,
                callback: function(value, sensor) {
                  // console.log('%s=%s (%s, fan)', sensor, value, device.id);
                  device.sensor.fanRaw = value;
                  // TODO: put this somewhere shareable between modules?
                  device.sensor.fan = ['Off', 'Low', 'High'][value];
                },
              });
              deviceMqtt.subscribe({
                topic: sensorChannel,
                group: 'device-list',
                sensor: 'filter',
                $scope: $scope,
                callback: function(value, sensor) {
                  // console.log('%s=%s (%s, filter)', sensor, value, device.id);
                  device.sensor.filterRaw = value;
                  // TODO: put this somewhere shareable between modules?
                  device.sensor.filter = value > 24;
                },
              });
              // Unsubscribe when leaving route.
              $scope.$on('$stateChangeStart', function() {
                deviceMqtt.unsubscribe({
                  topic: sensorChannel,
                  group: 'device-list',
                });
              });
            });
          }),
        ],
      });
  },
]);

module.exports = deviceListModule;
