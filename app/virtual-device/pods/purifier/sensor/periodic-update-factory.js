'use strict';

// How frequently how sensors publish their state
var SENSOR_READ_FREQUENCY = 10000;

// This service publishes periodic updates of the current value of our sensors
// on the sensor MQTT channel
var periodicSensorUpdate = ['mqttSensorPublisher',
  function(mqttSensorPublisher) {

    // Our polling methods manage the creation of our fake sensor data
    var poll;
    return {
      init: function(channel) {
        if (typeof poll !== 'undefined') {
          return;
        }
        // Emit an update, then begin polling
        mqttSensorPublisher.publishUpdate(null, channel);
        poll = setInterval(function() {
          mqttSensorPublisher.publishUpdate(null, channel);
        }, SENSOR_READ_FREQUENCY);
      },
    };
  }];

module.exports = periodicSensorUpdate;
