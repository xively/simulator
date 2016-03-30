'use strict';

// An interface between our fan store and our MQTT channels
var purifierResettingService = [
  '$rootScope', 'mqttService', 'deviceLogService', '$timeout',
  function($rootScope, mqttService, deviceLogService, $timeout) {
    function sendRecoveredNotify(deviceData, deviceLogChannel) {
      $rootScope.$broadcast('device.recovered', null, null);

      deviceData.message = 'Device recovered from error';
      deviceData.details = deviceData.message;
      deviceData.tags = ['reset', 'recovery'];
      deviceLogService.sendResetCommandMessage(deviceData, deviceLogChannel);
    }

    function sendResetNotify(deviceData, deviceLogChannel) {
      deviceData.message = 'Factory reset command received';
      deviceData.details = deviceData.message;
      deviceData.tags = ['reset', 'received'];
      deviceLogService.sendResetCommandMessage(deviceData, deviceLogChannel);

      $rootScope.$broadcast('device.reset', null, null);
      deviceData.message = 'Device is being reset';
      deviceData.details = deviceData.message;
      deviceData.tags = ['reset', 'resetting'];
      deviceLogService.sendResetCommandMessage(deviceData, deviceLogChannel);

      $timeout(function() {
        sendRecoveredNotify(deviceData, deviceLogChannel);
      }, 5000);
    }

    return {
      init: function(deviceData, controlChannel, deviceLogChannel) {
        mqttService.subscribe(controlChannel, function(mqttMessage) {
          var parsedMessage = null;
          try {
            parsedMessage = JSON.parse(mqttMessage.payloadString);
          } catch (e) {
            parsedMessage = {};
          }
          if (parsedMessage.command === 'factory-reset') {
            sendResetNotify(deviceData, deviceLogChannel);
          }
        });
      }
    };
  }];

module.exports = purifierResettingService;