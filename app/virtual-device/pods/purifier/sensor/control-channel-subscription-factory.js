'use strict';

var controlChannelSubscription = [
  '$rootScope', 'mqttService',
  function($rootScope, mqttService) {

    return {
      init: function(controlChannel) {
        mqttService.subscribe(controlChannel, function(message) {
          try {
            message = JSON.parse(message.payloadString);
            $rootScope.$broadcast(message.command, message);
          } catch (e) {
            var msg = 'Error during processing message from ' + controlChannel + ': ' + e.toString();
            console.log(msg);
          }
        });
      }
    };
  }];

module.exports = controlChannelSubscription;
