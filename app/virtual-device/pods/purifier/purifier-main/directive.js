'use strict';

var template = require('./template.tmpl');

module.exports = function() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      device: '=',
    },
    controller: ['$scope', 'mqttService', 'sensorProps',
      function($scope, mqttService, sensorProps) {
        // This is our initially displayed AQI value
        $scope.mode = 'home';

        $scope.newChannels = $scope.device.channels.filter(function(channel) {
          return !sensorProps[channel.channelTemplateName];
        });

        function emitUpdate(name, value) {
          mqttService.sendMessage(value, name);
        }

        $scope.emitUpdate = emitUpdate;
      }],
  };
};
