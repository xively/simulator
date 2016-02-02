'use strict';
module.exports = [
  function() {
    return {
      restrict: 'E',
      scope: {
        data: '=?',
      },
      link: function(scope, elm, attrs) {
        elm.qrcode({
          'size': 250,
          'color': '#3a3',
          'text': scope.data
        });
      },
    };
  },
];
