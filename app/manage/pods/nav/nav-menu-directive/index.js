'use strict';

module.exports = [
  '$timeout',
  function($timeout) {
    return {
      restrict: 'ACE',
      template: require('./template.tmpl'),
      link: function(scope, element) {
        scope.isOpen = false;

        element.click(function() {
          scope.$apply('isOpen = false;');
        });

        element.css('transition', 'none');
        function enableTransition() {
          element.css('transition', '');
        }
        function setPosition() {
          element.css('margin-left', scope.isOpen ? '' : -element.outerWidth());
        }
        var initialized = false;
        scope.$watch('isOpen', function() {
          if (initialized) {
            setPosition();
            return;
          }
          $timeout(function() {
            setPosition();
            $timeout(enableTransition);
            initialized = true;
          });
        });
      },
    };
  },
];
