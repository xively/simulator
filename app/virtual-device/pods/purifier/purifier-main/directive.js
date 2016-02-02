'use strict';

var template = require('./template.tmpl');

module.exports = function() {
  return {
    restrict: 'E',
    template: template,
    scope: {
      device: '=',
    },
    controller: ['$scope', function($scope) {
      // This is our initially displayed AQI value
      $scope.mode = 'home';
    }],
  };
};
