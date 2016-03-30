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
      $scope.navigate = function(destination) {
        var currentLocation = window.top.location.href;
        var split = currentLocation.indexOf('#');
        var baseUrl = currentLocation.slice(0, split);

        window.top.location.href = baseUrl + '#/' + destination;
      };
    }],
  };
};
