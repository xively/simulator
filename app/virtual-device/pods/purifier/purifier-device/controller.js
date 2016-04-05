'use strict';

var _ = require('lodash');

var purifierDeviceCtrl = [
  '$scope', 'cycleFan', 'controlChannelSubscription', 'purifierFanService', 'filterDepletion',
  'sensorProps', 'sensorStore', 'mqttSensorPublisher', 'propWiggle',
  'periodicSensorUpdate', 'deviceLogService', 'states', 'purifierResettingService', '$timeout',
  function(
    $scope, cycleFan, controlChannelSubscription, purifierFanService, filterDepletion,
    sensorProps, sensorStore, mqttSensorPublisher, propWiggle,
    periodicSensorUpdate, deviceLogService, states, purifierResettingService, $timeout
  ) {

    // A little hack to ensure that apply hasn't already begun
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof fn === 'function')) {
          fn();
        }
      } else {
        this.$apply(fn);
      }
    };

    var device = $scope.device;
    var controlChannel, sensorChannel, deviceLogChannel, deviceId;

    if (device) {
      deviceId = device.id;
      controlChannel = _.findWhere(device.channels, {
        channelTemplateName: 'control',
      }).channel;
      sensorChannel = _.findWhere(device.channels, {
        channelTemplateName: 'sensor',
      }).channel;
      deviceLogChannel = _.findWhere(device.channels, {
        channelTemplateName: 'device-log',
      }).channel;
      controlChannelSubscription.init(controlChannel);
      filterDepletion.init();
      propWiggle.init();
      periodicSensorUpdate.init(sensorChannel);
      purifierFanService.init(sensorChannel);
      purifierResettingService.init({
        deviceId: device.id,
        accountId: device.accountId,
        organizationId: device.organizationId,
        templateId: ''
      }, deviceLogChannel);
      device.state = states.OK;
    }

    // The throttled rate of updates as the user slides the device sensors,
    // in milliseconds
    var THROTTLED_UPDATE_RATE = 500;

    // Keep track of whether the filter is being depleted or not.
    $scope.depleting = false;
    $scope.$on('device.filterDepleting', function(event, isDepleting) {
      $scope.depleting = isDepleting;
    });

    // Attach sensor data to our scope
    _.each(sensorProps, function(val, key) {
      $scope[key] = val;
      var scopeValue = key + 'Value';
      $scope[scopeValue] = val.initial;
    });

    function changeValue(modelKey, newValue) {
      var scopeValue = modelKey + 'Value';
      $scope[scopeValue] = newValue;
    }

    /**
     * Create a log message with the actual device data
     * @param {Array<string>} tags tags
     * @param {string} message message to send
     * @returns  {object} log message
     */
    function createLogMessage(tags, message) {
      var logDevice = $scope.device;
      var logMessage = {
        deviceId: logDevice.id,
        accountId: logDevice.accountId,
        organizationId: logDevice.organizationId,
        templateId: logDevice.deviceTemplateId,
        message: message,
        details: message,
        tags: tags
      };
      return logMessage;
    }

    function sendFanStateLogMessage(currentFanState) {
      var fanStates = sensorProps.fan.map;

      if (currentFanState >= fanStates.length) {
        throw new Error('Current fan state is not valid: ' + currentFanState);
      }

      deviceLogService.sendInfoMessage(createLogMessage(['informational'], 'Fan state is: ' + fanStates[currentFanState].toUpperCase()), deviceLogChannel);
    }

    $scope.$on('log-fan-state', function(event, currentFanState) {
      sendFanStateLogMessage(currentFanState);
    });

    function sendMalfunctionMessage() {
      var logDevice = $scope.device;
      var malfunctionData = {
        deviceId: logDevice.id,
        accountId: logDevice.accountId,
        organizationId: logDevice.organizationId,
        templateId: logDevice.deviceTemplateId,
        message: 'Sensor malfunction occured',
        details: 'Sensor malfunction occured',
        tags: ['malfunction']
      };
      deviceLogService.sendMalfunctionMessage(malfunctionData, deviceLogChannel);
    }

    function setDeviceState(state) {
      $scope.$applyAsync(function() {
        $scope.device.state = state;
      });

      if (state === states.OK) {
        periodicSensorUpdate.enable();
        propWiggle.enable();
      } else {
        periodicSensorUpdate.disable();
        propWiggle.disable();
      }
    }

    $scope.doMalfunction = function(modelKey, newValue) {
      if ($scope.device.state === states.MALFUNCTION) {
        return;
      }

      changeValue(modelKey, newValue);
      sendMalfunctionMessage();
      setDeviceState(states.MALFUNCTION);
    };

    $scope.$on('device.reset', function() {
      setDeviceState(states.RESETTING);
    });

    $scope.$on('device.recovered', function() {
      setDeviceState(states.RECOVERED);

      _.each(sensorProps, function(val, key) {
        var scopeValue = key + 'Value';
        $scope[scopeValue] = sensorStore.get(key);
      });

      $timeout(function() {
        setDeviceState(states.OK);
      }, 1000);
    });

    // Update the sensor data as it changes in the local store
    $scope.$on('device.sensors', function(event, prop, value) {
      $scope.safeApply(function() {
        $scope[prop + 'Value'] = value;
      });
    });

    // This is called when a user interacts with the interface
    // to update a property.
    function updateProp(key, value) {
      // Coerce to a number, then bail if this yields a NaN
      value = parseInt(value, 10);
      if (isNaN(value)) {
        return;
      }

      // Update our internal store
      if (sensorStore.set(key, value)) {
        mqttSensorPublisher.publishUpdate([key], sensorChannel);
      }
    }

    $scope.onSlide = _.throttle(function(key) {
      var currentVal = parseInt($scope[key + 'Value'], 10);
      updateProp(key, currentVal);
    }, THROTTLED_UPDATE_RATE);

    // When the fan is clicked, we update it by cycling through the fan
    $scope.onClickFan = function() {
      if ($scope.isOk()) {
        var currentFanState = cycleFan();
        sendFanStateLogMessage(currentFanState);
        updateProp('fan', currentFanState);
      }
    };

    $scope.toggleBoolean = function(scopeValue) {
      $scope[scopeValue] = !$scope[scopeValue];
    };

    $scope.onClickDepleteFilter = function() {
      deviceLogService.sendInfoMessage(createLogMessage(['informational'], 'Filter depleted'), deviceLogChannel);
      filterDepletion.depleteFilter(deviceId, sensorChannel);
    };

    $scope.onClickReplaceFilter = function() {
      deviceLogService.sendInfoMessage(createLogMessage(['informational'], 'Filter replaced'), deviceLogChannel);
      filterDepletion.replaceFilter(deviceId, sensorChannel);
    };

    $scope.isOk = function() {
      return $scope.device.state === states.OK || $scope.device.state === states.RECOVERED;
    };

    $scope.isMalfunction = function() {
      return $scope.device.state === states.MALFUNCTION;
    };

    $scope.isResetting = function() {
      return $scope.device.state === states.RESETTING;
    };
  }];

module.exports = purifierDeviceCtrl;
