'use strict';

// An interface between our fan store and our MQTT channels
var purifierFanService = [
  '$rootScope', 'mqttService', 'sensorStore',
  'sensorProps', 'mqttSensorPublisher',
  function($rootScope, mqttService, sensorStore, sensorProps, mqttSensorPublisher) {
    var poll;
    var _sensorChannel;
    var trend = 'asc';

    return {
      // Sets up a two-way listener for fan speed.
      init: function(controlChannel, sensorChannel) {
        _sensorChannel = sensorChannel;
        // Updates the fan speed when a message is sent over MQTT
        mqttService.subscribe(controlChannel, function(message) {
          try {
            message = JSON.parse(message.payloadString);
          } catch (e) {
            message = {};
          }
          if (message.command !== 'speed') {
            return;
          }
          var msgOption = message.option.toLowerCase();
          var newIndex = sensorProps.fan.map.indexOf(msgOption);
          if (sensorStore.set('fan', newIndex)) {
            mqttSensorPublisher.publishUpdate(['fan'], sensorChannel);
          }
        });
      },
      startSimulation: function(interval) {
        poll = setInterval(function() {
          var currentIndex = sensorStore.get('fan');

          if (currentIndex === sensorProps.fan.max) {
            trend = 'desc';
          } else if (currentIndex === sensorProps.fan.min) {
            trend = 'asc';
          }

          var newIndex = trend === 'asc' ? ++currentIndex : --currentIndex;

          sensorStore.set('fan', newIndex);
          mqttSensorPublisher.publishUpdate(['fan'], _sensorChannel);
        }, interval);
      },
      stopSimulation: function() {
        clearInterval(poll);
      }
    };
  }];

module.exports = purifierFanService;
