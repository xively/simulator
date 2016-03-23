'use strict';

var template = require('./template.tmpl');

module.exports = [function() {
  return {
    restrict: 'E',
    scope: {
      name: '@model',
      model: '&',
      labelPosition: '&',
      device: '&'
    },
    transclude: true,
    template: template,

    link: function($scope, element, attrs, ctrl, $transclude) {
      $transclude($scope, function(clone) {
        var cloneSearch = clone.find('purifier-info-title')
          .addBack('purifier-info-title');
        if (cloneSearch.length) {
          clone = cloneSearch;
        }
        element.find('[title-transclude]')
          .empty()
          .append(clone);
      }, 'title');

      $transclude($scope, function(clone) {
        clone = clone.find('purifier-info-popover')
          .addBack('purifier-info-popover');
        if (clone.length) {
          element.find('[popover-transclude]')
            .empty()
            .append(clone);
        }
      }, 'popover');
    },

    controller: ['$parse', '$scope', 'states', function($parse, $scope, states) {
      $scope.states = states;
      if ($scope.device && $scope.device()) {
        var valueProperty = $parse($scope.name + 'Value');
        $scope.value = valueProperty($scope.device());
        $scope.device().$watch($scope.name + 'Value', function() {
          $scope.value = valueProperty($scope.device());
        });
        $scope.$watch('value', function() {
          valueProperty.assign($scope.device(), $scope.value);
        });
        $scope.change = function() {
          // Perform logic on the next js tick so that
          // watch has a chance to fire.
          setTimeout(function() {
            $scope.device().onSlide($scope.name);
          }, 0);
        };
      }

      $scope.active = false;

      $scope.toggleActive = function() {
        $scope.active = !$scope.active;
      };

      $scope.doMalfunction = function(){
        $scope.device().doMalfunction($scope.name, -255);
      };

      $scope.isMalfunction = function(){
        var result = !$scope.active && $scope.device().device.state === states.MALFUNCTION && $scope.name === 'dust';
        return result;
      };
    }],
  };
}];
