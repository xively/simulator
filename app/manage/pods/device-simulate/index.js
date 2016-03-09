'use strict';

var _ = require('lodash');
var angular = require('angular');
require('angular-ui-router');

var resolveArgs = require('../common/utils/resolve-args');

var deviceSimulatorModule = angular.module('concaria-manage-device-simulate', ['ui.router']);

// Sensor simulation logic.
function sensorValue(options) {
  return function(current) {
    // If wiggle, use 1% < N < wiggle%, otherwise don't wiggle.
    var wiggle = options.wiggle ? _.random(0.01, options.wiggle) : 1;
    // Adjust current value by delta.
    if (current !== null && options.delta) {
      current += options.delta * wiggle;
    // Adjust current value +/- by wiggle % of total range.
    } else if (current !== null && options.wiggle) {
      current += (options.max - options.min) * wiggle * _.sample([1, -1]);
    // No current value, get the initial value.
    } else if ('initial' in options) {
      current = options.initial;
    // No current value, get a random value.
    } else {
      current = _.random(options.min, options.max);
    }
    // Ensure current value falls within min and max range.
    return Math.min(options.max, Math.max(options.min, _.round(current)));
  };
}

// Per-sensor constraints.
var sensorValues = {
  co: sensorValue({
    min: 0,
    max: 500,
    initial: 25,
    wiggle: 0.01,
  }),
  dust: sensorValue({
    min: 0,
    max: 500,
    initial: 1,
    wiggle: 0.01,
  }),
  fan: sensorValue({
    min: 0,
    max: 2,
  }),
  filter: sensorValue({
    min: 0,
    max: 1000,
    initial: 1000,
    wiggle: 0.4,
    delta: -50,
  }),
  humidity: sensorValue({
    min: 0,
    max: 100,
    initial: 20,
    wiggle: 0.03,
  }),
  no2: sensorValue({
    min: 0,
    max: 0,
    initial: 0,
  }),
  temp: sensorValue({
    min: -40,
    max: 125,
    initial: 26,
    wiggle: 0.02,
  }),
};

deviceSimulatorModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('device.simulate-shortcut', {
        url: '/device/{ids}/simulate?sensors&delay',
        controller: [
          '$stateParams', '$state',
          function($stateParams, $state) {
            $state.go('device.simulate', $stateParams, {location: 'replace'});
          },
        ],
      })
      .state('device.simulate', {
        url: '/devices/simulate?ids&sensors&delay',
        template: require('./template.tmpl'),
        controller: [
          '$scope', '$rootScope', '$stateParams', 'deviceSimulator',
          function($scope, $rootScope, $stateParams, deviceSimulator) {
            var items = [];
            // When a device message is received, add it onto the array and
            // update the view. Only save the 50 most recent items.
            $rootScope.$on('simulated-device-message', function(event, item) {
              items = [item].concat(items.slice(0, 49));
              $scope.$apply(function() {
                $scope.items = items;
              });
            });

            var simulatorOptions = {
              deviceIds: $stateParams.ids && $stateParams.ids.split(','),
              sensors: $stateParams.sensors && $stateParams.sensors.split(','),
              delay: $stateParams.delay,
            };
            $scope.simulatePlayPause = 'Play';

            // Stop the simulator if the route changes!
            $scope.$on('$stateChangeStart', function() {
              deviceSimulator.stop();
              $scope.simulatePlayPause = 'Play';
            });
            // Start the simulator.
            $scope.$on('$stateChangeSuccess', function() {
              deviceSimulator.start(simulatorOptions);
              $scope.simulatePlayPause = 'Pause';
            });

            $scope.toggleSimulation = function() {
              var isPlaying = deviceSimulator.toggle(simulatorOptions);
              $scope.simulatePlayPause = isPlaying ? 'Pause' : 'Play';
            };
          },
        ],
        resolve: {
          deviceSimulator: [
            '$rootScope', 'BlueprintDevices', 'deviceMqtt',
            resolveArgs({indices: [1]}, function($rootScope, devices, deviceMqtt) {
              var intervalId;

              // Get a random device from the given list of device ids (or all
              // devices if none are specified).
              function getRandomDevice(deviceIds) {
                return deviceIds ? _.find(devices, 'id', _.sample(deviceIds)) : _.sample(devices);
              }

              // Get only valid sensors from the passed-in array (defaults to
              // all sensors if no valid sensors are specified).
              function getValidSensors(sensors) {
                var validSensors = _.keys(sensorValues);
                if (sensors) {
                  sensors = _.intersection(validSensors, sensors);
                }
                if (!sensors || sensors.length === 0) {
                  sensors = validSensors;
                }
                return sensors;
              }

              // Publish all specified sensors for the specified device.
              var currentSensorData = {};
              function sendRandomSensorData(device, sensors) {
                // Get random data for specified sensors.
                var sensorData = _.zipObject(_.map(getValidSensors(sensors), function(sensor) {
                  var data = currentSensorData[device.id];
                  var value = sensorValues[sensor](data ? data[sensor] : null);
                  return [sensor, value];
                }));
                currentSensorData[device.id] = sensorData;

                // Emit values so they can be displayed in the view.
                $rootScope.$emit('simulated-device-message', {
                  device: device.id,
                  sensorData: sensorData,
                });

                // Actually send sensor data!
                deviceMqtt.sendSensorData(device, sensorData);
              }

              // Stop simulator.
              function stop() {
                if (intervalId) {
                  clearInterval(intervalId);
                }
                intervalId = null;
              }

              // Start simulator.
              function start(options) {
                // Use specified delay or a reasonable default.
                var delay = options.delay || (options.deviceIds ? 1000 / options.deviceIds.length : 200);
                // Ensure simulator is stopped.
                stop();
                // Start simulator.
                intervalId = setInterval(function() {
                  var device = getRandomDevice(options.deviceIds);
                  var sensors = getValidSensors(options.sensors);
                  sendRandomSensorData(device, sensors);
                }, delay);
              }

              // Toggle simulator.
              function toggle(options) {
                var retval = false;
                if (intervalId) {
                  stop();
                } else {
                  start(options);
                  retval = true;
                }
                return retval;
              }

              return {
                start: start,
                stop: stop,
                toggle: toggle,
                getRandomDevice: getRandomDevice,
                getValidSensors: getValidSensors,
                sendRandomSensorData: sendRandomSensorData,
                sendSensorData: deviceMqtt.sendSensorData.bind(deviceMqtt),
              };
            }),
          ],
        },
      });
  },
]);

module.exports = deviceSimulatorModule;
