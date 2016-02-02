'use strict';

// Emits sensor updates on the MQTT channel
var mqttDeviceInfoPublisher = ['mqttService',
  function(mqttService) {
    return {
      // Emits an event sharing that the filter has been changed
      publishFilterChange: function(deviceId, channel) {
        // This Object must adhere to the spec for emitting on
        // the device info channel
        var dataObj = {
          data: {
            message: {
              type: 'DeviceInfo',
              deviceId: deviceId,
              action: 'filter_change',
              result: 'Success',
              details: 'Device filter has been replaced',
            },
          },
        };

        mqttService.sendMessage(
          JSON.stringify(dataObj), channel
        );
      },
    };
  }];

module.exports = mqttDeviceInfoPublisher;
