'use strict';

module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      scope: {
        message: '=?',
        messageHeader: '=?',
        alertType: '=?',
        dismissAlert: '&'
      },
      link: function(scope, elm, attrs) {
        scope.removeAlert = function() {
          console.log('hello!', scope);
          scope.dismissAlert()();
        };
      },
    };
  },
];
