'use strict';

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
          $scope.units = sensorUnitConfig;
          $scope.data = {
            availableOptions: $scope.tabs,
            selectedOption: $scope.tabs[0]
          };
          $scope.data.selectedOption.load();
        },
      ],
    };
  },
];
