'use strict';

module.exports = [
  function() {
    return {
      restrict: 'E',
      scope: {
        visible: '=',
      },
      template: require('./template.tmpl'),
      transclude: true,
      link: function(scope, element) {
        scope.$watch('visible', function() {
          element.toggleClass('iphone-frame-visible', scope.visible);
        });
      },
    };
  },
];
