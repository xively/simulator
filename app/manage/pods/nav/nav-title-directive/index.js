'use strict';

module.exports = [
  '$state',
  function($state) {
    return {
      restrict: 'ACE',
      scope: {
        menuClick: '&',
      },
      template: require('./template.tmpl'),
      link: function(scope, element) {
        var computeTitle = function() {
          if ($state.$current.path.length) {
            scope.title = $state.$current.path[0].self.name;
          }
          else {
            scope.title = 'Loading ...';
          }
        };
        computeTitle();
        scope.$on('$stateChangeSuccess', function() {
          computeTitle();
        });
      },
    };
  },
];
