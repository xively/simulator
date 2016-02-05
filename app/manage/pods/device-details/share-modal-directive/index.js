'use strict';
var Clipboard = require('clipboard');
module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      scope: {
        closeModal: '&'
      },
      controller: [
        '$scope',
        '$timeout',
        function($scope, $timeout) {
          // template variables -------------------
          $scope.copySuccess = false;
          $scope.url = window.location.hostname + window.location.pathname;

          // create clipboard ---------------------
          var clipboard = new Clipboard('.copy-btn');
          clipboard.on('success', function(e) {
            $scope.copySuccess = true;
          });

          // remove modal -------------------------
          $scope.removeModal = function() {
            $scope.closeModal()();
          };

        },
      ],
    };
  },
];
