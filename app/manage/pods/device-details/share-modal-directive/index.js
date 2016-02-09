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
        '$location',
        function($scope, $timeout, $location) {

          // template variables -------------------
          $scope.copySuccess = false;
          $scope.url = $location.absUrl().replace('?demo=1', '');

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
