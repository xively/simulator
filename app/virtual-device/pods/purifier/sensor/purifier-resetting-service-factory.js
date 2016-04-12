'use strict';

// An interface between our fan store and our MQTT channels
var purifierResettingService = [
  '$rootScope', 'deviceLogService', '$timeout',
  function($rootScope, deviceLogService, $timeout) {
    function sendRecoveredNotify(deviceData, deviceLogChannel) {
      $rootScope.$broadcast('device.recovered', null, null);

      deviceData.message = 'Device recovered from error';
      deviceData.details = deviceData.message;
      deviceData.tags = ['reset', 'recovery'];
      deviceLogService.sendInfoMessage(deviceData, deviceLogChannel);
    }

    function sendResetNotify(deviceData, deviceLogChannel) {
      deviceData.message = 'Factory reset command received';
      deviceData.details = deviceData.message;
      deviceData.tags = ['reset', 'received'];
      deviceLogService.sendInfoMessage(deviceData, deviceLogChannel);

      $rootScope.$broadcast('device.reset', null, null);
      deviceData.message = 'Device is being reset';
      deviceData.details = deviceData.message;
      deviceData.tags = ['reset', 'resetting'];
      deviceLogService.sendInfoMessage(deviceData, deviceLogChannel);

      $timeout(function() {
        sendRecoveredNotify(deviceData, deviceLogChannel);
      }, 5000);
    }

    return {
      init: function(deviceData, deviceLogChannel) {
        $rootScope.$on('factory-reset', function() {
          sendResetNotify(deviceData, deviceLogChannel);
        });
      }
    };
  }];

module.exports = purifierResettingService;