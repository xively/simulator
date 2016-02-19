'use strict';

var angular = require('angular');
require('angular-ui-router');
var _ = require('lodash');

var resolveArgs = require('../common/utils/resolve-args');

var commonModule = require('../common');

var deviceDetailsModule = angular.module('concaria-manage-device-details', [
  'ui.router',
  commonModule.name
]);

deviceDetailsModule.directive('deviceDetailsChart', require('./device-details-chart-directive'));
deviceDetailsModule.directive('deviceDetailsChartTabs', require('./device-details-chart-tabs-directive'));
deviceDetailsModule.directive('shareModal', require('./share-modal-directive'));
deviceDetailsModule.directive('deviceDetailsAlert', require('./device-details-alert-directive'));

deviceDetailsModule.service('Chart', require('./chart-service'));
deviceDetailsModule.service('ChartDataTool', require('./chart-data-tool-service'));

deviceDetailsModule.filter('toIntWithUnit', require('./to-int-with-unit-filter'));

deviceDetailsModule.value('deviceConfig', require('./value/device-config'));
deviceDetailsModule.value('basicChartConfig', require('./value/basic-chart-config'));
deviceDetailsModule.value('aqiChartConfig', require('./value/aqi-chart-config'));
deviceDetailsModule.value('sensorChartConfig', require('./value/sensor-chart-config'));
deviceDetailsModule.value('sensorUnitConfig', require('./value/sensor-unit-config'));

deviceDetailsModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('device.details', {
        url: '/device/:deviceId?{demo:bool}&{noheader:bool}',
        template: require('./template.tmpl'),
        controller: [
          '$scope',
          '$rootScope',
          '$stateParams',
          'BlueprintDevices',
          'deviceMqtt',
          'deviceConfig',
          'AqiData',
          'TimeSeries',
          'ChartDataTool',
          'sensorUnitConfig',
          'applicationConfig',
          resolveArgs({$scopeIndex: 0, indices: [3]}, function(
            $scope,
            $rootScope,
            stateParams,
            devices,
            deviceMqtt,
            deviceConfig,
            AqiData,
            TimeSeries,
            chartDataTool,
            sensorUnitConfig,
            applicationConfig
          ) {
            var device = _.cloneDeep(_.find(devices, 'id', stateParams.deviceId));
            if (!device) {
              console.error('device %s not found', stateParams.deviceId);
            }
            if (stateParams.noheader) {
              $rootScope.$broadcast('toggleHeader', true);
            }
            if (stateParams.demo) {
              $rootScope.$broadcast('toggleDemo', true);
              $rootScope.$broadcast('toggleVirtualDevice', stateParams.deviceId);
            }
            $scope.email = applicationConfig.emailAddress;
            $scope.units = sensorUnitConfig;
            $scope.device = device;
            $scope.deviceStatus = device;
            $scope.fanProperties = deviceConfig.fan;
            $scope.customData = {
              alert: {
                filter: false,
                co: false,
              },
              latestAqi: null,
            };

            AqiData.getLatestValue()
            .then(function(latestValue) {
              $scope.$applyAsync(function() {
                $scope.customData.latestAqi = latestValue;
                device.sensor.aqi = latestValue.value;
              });
            });

            var controlChannel = _.find(device.channels, 'channelTemplateName', 'control').channel;
            var sensorChannel = _.find(device.channels, 'channelTemplateName', 'sensor').channel;

            device.deviceConnected = false;

            // Any mqtt sensor data will be stored on this object.
            device.sensor = {};
            // Subscribe to mqtt sensor changes.
            deviceMqtt.subscribe({
              topic: sensorChannel,
              group: 'device-detail',
              $scope: $scope,
              callback: function(value, sensor) {
                device.deviceConnected = true;
                device.sensor[sensor] = value;
              },
            });

            // These variables keep track of if the user has dismissed an
            // alert. Since the device emits updates every few seconds, without
            // an internal store keeping track of dismissals, the alerts would
            // immediately reappear. These turn off again if the reason for the
            // alert is resolved, so that subsequent alerts will trigger.
            var ignoreFilterAlerts = false;
            var ignoreCOAlerts = false;

            $scope.$watch('device.sensor.filter', function() {
              $scope.customData.alert.filter = false;
              if (
                device.sensor &&
                typeof device.sensor.filter !== 'undefined' &&
                device.sensor.filter <= 24 &&
                !ignoreFilterAlerts
              ) {
                $scope.customData.alert.filter = true;
              }
              else if (_.get(device, 'sensor.filter') > 24) {
                ignoreFilterAlerts = false;
              }
            });

            $scope.displayModal = false;
            $scope.toggleModal = function() {
              $scope.displayModal = !$scope.displayModal;
            };

            // TODO: Remove once a filter directive can handle this.
            $scope.filterLife = {
              dashOffset: 0,
              dashArray: 629,
            };

            // TODO: Remove once a filter directive can handle this.
            $scope.$watch('device.sensor.filter', function() {
              var fMax = 1000;
              var fActual = parseInt(device.sensor.filter || 0, 10);
              var dArray = $scope.filterLife.dashArray;
              $scope.filterLife.dashOffset = Math.min(
                dArray,
                dArray - (parseInt((fActual / fMax) * dArray, 10))
              );
              if (fActual > 48) {
                fActual = Math.round(fActual / 24);
                $scope.filterLife.measure = 'days';
              }
              else {
                $scope.filterLife.measure = 'hours';
              }
              $scope.filterLife.lifeLeft = fActual;
            });

            $scope.$watch('device.sensor.co', function() {
              $scope.customData.alert.co = false;
              if (
                device.sensor &&
                typeof device.sensor.co !== 'undefined' &&
                device.sensor.co > 100 &&
                !ignoreCOAlerts
              ) {
                $scope.customData.alert.co = true;
              }
              else if (_.get(device, 'sensor.co') <= 100) {
                ignoreCOAlerts = false;
              }
            });

            $scope.clearFilterAlert = function() {
              ignoreFilterAlerts = true;
              $scope.customData.alert.filter = false;
            };

            $scope.clearCOAlert = function() {
              ignoreCOAlerts = true;
              $scope.customData.alert.co = false;
            };

            $scope.toggleVirtualDevice = function() {
              $rootScope.$broadcast('toggleVirtualDevice', stateParams.deviceId);
            };

            $scope.changeFanSpeedTo = function(newSpeed) {
              deviceMqtt.sendCommand(device, {
                command: 'speed',
                option: newSpeed.toLowerCase(),
              });

              // TODO: The device should send this, not us ...
              deviceMqtt.sendSensorData(device, {
                fan: deviceConfig.fan.speed.indexOf(newSpeed),
              });
            };

            deviceMqtt.subscribe({
              topic: controlChannel,
              group: 'device-detail',
              command: 'speed',
              $scope: $scope,
              callback: function(option, command) {
                device.deviceConnected = true;
                device._fanSpeed = option.toLowerCase();
              },
            });

            $scope.$watch('device._fanSpeed', function() {
              device.sensor.fan = deviceConfig.fan.speed.indexOf(device._fanSpeed);
            });

            // TODO: Remove after we have a fan directive that can calculate this.
            $scope.$watch('device.sensor.fan', function() {
              device.fanSpeed = deviceConfig.fan.speed[device.sensor.fan];
              device.fanStatus = device.fanSpeed === deviceConfig.fan.speed[0].toLowerCase() ?
              deviceConfig.fan.state.off :
              deviceConfig.fan.state.on;
            });

            // Unsubscribe when leaving route.
            $scope.$on('$stateChangeStart', function() {
              deviceMqtt.unsubscribe({
                topic: sensorChannel,
                group: 'device-detail',
              });
            });

            TimeSeries.getMostRecentSensorHistory(stateParams.deviceId)
            .then(function(sensorHistory) {
              $scope.$applyAsync(function() {
                for (var i in deviceConfig.sensorList) {
                  if (
                    deviceConfig.sensorList.hasOwnProperty(i) &&
                    sensorHistory.hasOwnProperty(i)
                  ) {
                    device.sensor[i] = sensorHistory[i];
                  }
                }
                device.deviceConnected = true;
              });
            });

            $scope.chartTabs = [
              {
                name: 'dust',
                title: 'Dust',
              },
              {
                name: 'aqi',
                title: 'AQI',
              },
              {
                name: 'co',
                title: 'CO',
              },
              {
                name: 'temp',
                title: 'Temp',
              },
              {
                name: 'humidity',
                title: 'Humidity',
              },
            ].map(function(item) {
              item.value = $scope.device.sensor[item.name];
              item.chartData = chartDataTool.baseChartData({sensor: item.name});
              item.loaded = null;
              item.load = function() {
                if (item.loaded) {
                  return item.loaded;
                }
                item.loaded = chartDataTool.loadDataSource({
                  deviceId: stateParams.deviceId,
                  sensor: item.name,
                })
                .catch(function() {
                  return {data: []};
                })
                .then(function(dataSource) {
                  $scope.$applyAsync(function() {
                    // Trigger data change at chartData to pass down to chart.
                    item.chartData.dataSource = angular.merge({}, item.chartData.dataSource, dataSource);
                  });
                  return item.chartData;
                });
                return item.loaded;
              };

              var maxDataPoints = 24 * 3600 / 2;
              $scope.$watch('device.sensor.' + item.name, function() {
                item.value = $scope.device.sensor[item.name];
                if (item.name !== 'aqi' && item.loaded) {
                  item.loaded
                  .then(function() {
                    $scope.$applyAsync(function() {
                      item.chartData.dataSource.data.push({value: item.value});
                      if (item.chartData.dataSource.data.length > maxDataPoints) {
                        var dataSource = item.chartData.dataSource;
                        dataSource.data = dataSource.data.slice(-maxDataPoints);
                      }
                    });
                  });
                }
              });

              return item;
            });
          }),
        ],
      });
  },
]);

module.exports = deviceDetailsModule;
