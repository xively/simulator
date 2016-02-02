'use strict';

module.exports = [
  function() {
    return {
      restrict: 'ACE',
      scope: {
        icon: '@',
        loaderIf: '&',
      },
      template: require('./template.tmpl'),
      transclude: true,
    };
  },
];
