'use strict';

module.exports = [
  '$state',
  function($state) {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      transclude: true,
      scope: {
        activeSref: '@',
        icon: '@',
        sref: '@',
      },
      link: function(scope, element) {
        if (!scope.activeSref) {
          scope.activeSref = scope.sref;
        }
        scope.iconActive = scope.icon.replace(/\.svg$/, '-active.svg');

        var link = element.find('.nav-bar-item-link');
        link.toggleClass('active', $state.includes(scope.activeSref) === true);
        scope.$on('$stateChangeSuccess', function() {
          link.toggleClass('active', $state.includes(scope.activeSref) === true);
        });
      },
    };
  },
];
