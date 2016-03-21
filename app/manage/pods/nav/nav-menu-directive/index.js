'use strict';

module.exports = [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'ACE',
      template: require('./template.tmpl'),
      controller: ['$scope', '$stateParams', function($scope, $stateParams) {
        $scope.params = $stateParams;
      }],
      link: function(scope, element) {
        scope.isOpen = false;

        element.click(function() {
          scope.$apply('isOpen = false;');
        });

        function setPosition() {
          element.css('margin-left', scope.isOpen ? 0 : -element.outerWidth());
        }

        scope.$watch('isOpen', function(oldValue, newValue) {
          if (oldValue !== newValue) {
            setPosition();
          }
        });
      },
    };
  },
];
