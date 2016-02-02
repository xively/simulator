'use strict';

var template = require('./template.tmpl');

module.exports = function() {
  return {
    restrict: 'C',
    template: template,
    scope: {
      mode: '=',
    },
    controller: ['$scope', function($scope) {
      $scope.onClickHome = function() {
        $scope.mode = 'home';
      };

      $scope.onClickIndustrial = function() {
        $scope.mode = 'industrial';
      };
    }],
  };
};
