'use strict';

var _ = require('lodash');

module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      scope: {
        tabs: '=',
      },
      controller: [
        '$scope',
        'sensorUnitConfig',
        function($scope, sensorUnitConfig) {
          $scope.currentChart = 'aqi';
          $scope.units = sensorUnitConfig;

          $scope.switchChart = function(newChart) {
            $scope.currentChart = newChart;
            $scope.currentTab = _.find($scope.tabs, 'name', newChart);
            $scope.currentTab.load();
          };

          $scope.switchChart($scope.currentChart);
        },
      ],
    };
  },
];
