'use strict';

module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      scope: {
        conditionalMode: '&',
        mode: '='
      },
      link: function(scope, elm, attrs) {
        scope.showModeSelect = false;
        scope.toggleProperty = function(type) {
          scope[type] = !scope[type];
        };
      },
    };
  },
];
