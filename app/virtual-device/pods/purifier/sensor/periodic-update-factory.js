'use strict';

// How frequently how sensors publish their state
var SENSOR_READ_FREQUENCY = 10000;

// This service publishes periodic updates of the current value of our sensors
// on the sensor MQTT channel
var periodicSensorUpdate = ['mqttSensorPublisher',
  function(mqttSensorPublisher) {
    var isEnabled = true;

    // Our polling methods manage the creation of our fake sensor data
    var poll;
    var _channel;
    return {
      init: function(channel) {
        _channel = channel;
        this.start();
      },
      start: function(interval) {
        if (poll) {
          clearInterval(poll);
        }

        if (isEnabled) {
          mqttSensorPublisher.publishUpdate(null, _channel);
        }
        poll = setInterval(function() {
          if (isEnabled) {
            mqttSensorPublisher.publishUpdate(null, _channel);
          }
        }, interval || SENSOR_READ_FREQUENCY);
      },
      startSimulation: function(interval) {
        this.start(interval);
      },
      stopSimulation: function() {
        this.start(SENSOR_READ_FREQUENCY);
      },
      enable: function() {
        isEnabled = true;
      },
      disable: function() {
        isEnabled = false;
      }
    };
  }];

module.exports = periodicSensorUpdate;
