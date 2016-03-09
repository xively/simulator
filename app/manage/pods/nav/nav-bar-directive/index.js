'use strict';

module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      controller: [
        '$scope',
        '$stateParams',
        function($scope, $stateParams) {
          $scope.params = $stateParams;
        }
      ]
    };
  },
];
