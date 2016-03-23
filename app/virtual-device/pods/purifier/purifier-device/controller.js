'use strict';

var _ = require('lodash');

var purifierDeviceCtrl = [
  '$scope', 'cycleFan', 'purifierFanService', 'filterDepletion',
  'sensorProps', 'sensorStore', 'mqttSensorPublisher', 'propWiggle',
  'periodicSensorUpdate', 'deviceLogService',
  function(
    $scope, cycleFan, purifierFanService, filterDepletion,
    sensorProps, sensorStore, mqttSensorPublisher, propWiggle,
    periodicSensorUpdate, deviceLogService
  ) {

    // A little hack to ensure that apply hasn't already begun
    $scope.safeApply = function(fn) {
      var phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        if (fn && (typeof fn === 'function')) {
          fn();
        }
      }
      else {
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
      filterDepletion.init();
      propWiggle.init();
      periodicSensorUpdate.init(sensorChannel);
      purifierFanService.init(controlChannel, sensorChannel);
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

    function changeValue(modelKey, newValue){
      var scopeValue = modelKey + 'Value';
      $scope[scopeValue] = newValue;
    }

    function sendMalfunctionMessage(){
      var device = $scope.device;
      var malfunctionData = {
        deviceId: device.id,
        accountId: device.accountId,
        organizationId: device.organizationId,
        templateId: '',
        message: 'Sensor malfunction occured',
        details: '',
        tags: ['malfunction'],
      };
      deviceLogService.sendMalfunctionMessage(malfunctionData, deviceLogChannel);
    }

    $scope.doMalfunction = function(modelKey, newValue){
      changeValue(modelKey, newValue);
      sendMalfunctionMessage();
    };

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
      if (isNaN(value)) { return; }

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
      updateProp('fan', cycleFan());
    };

    $scope.toggleBoolean = function(scopeValue) {
      $scope[scopeValue] = !$scope[scopeValue];
    };

    $scope.onClickDepleteFilter = function() {
      filterDepletion.depleteFilter(deviceId, sensorChannel);
    };

    $scope.onClickReplaceFilter = function() {
      filterDepletion.replaceFilter(deviceId, sensorChannel);
    };
  }];

module.exports = purifierDeviceCtrl;
