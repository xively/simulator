'use strict';

var template = require('./template.tmpl');

module.exports = function() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      device: '=',
    },
    controller: [
      '$scope',
      'periodicSensorUpdate',
      'propWiggle',
      'purifierFanService',
      function($scope, periodicSensorUpdate, propWiggle, purifierFanService) {
        // This is our initially displayed AQI value
        $scope.mode = 'home';
        $scope.simulationRunning = false;

        $scope.toggleSimulation = function() {
          if ($scope.simulationRunning) {
            propWiggle.stopSimulation();
            periodicSensorUpdate.stopSimulation();
            purifierFanService.stopSimulation();
          } else {
            propWiggle.startSimulation(1000);
            periodicSensorUpdate.startSimulation(1000);
            purifierFanService.startSimulation(3000);
          }
          $scope.simulationRunning = !$scope.simulationRunning;
        };
      }]
  };
};
