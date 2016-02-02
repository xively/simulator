'use strict';

var angular = require('angular');

module.exports = [
  function() {
    return {
      restrict: 'AC',
      link: function(scope, element) {
        scope.toggleMenu = function() {
          var menuScope = angular.element(element.parents().find('nav-menu')).scope();
          menuScope.isOpen = !menuScope.isOpen;
        };
      },
    };
  },
];
