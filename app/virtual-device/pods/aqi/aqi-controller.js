'use strict';

var aqiCtrl = ['$scope', function($scope) {
  // This is our initially displayed AQI value
  $scope.aqi = 0;

  // Listen to AQI updates, and update our scope.
  $scope.$on('aqi.update', function(event, aqiValue) {
    $scope.aqi = aqiValue;
  });
}];

module.exports = aqiCtrl;
