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

          function scrubUrl() {
            // remove demo=1
            var url = $location.absUrl().replace('?demo=1', '');
            // if no header doesn't exist add it noheader=1
            if ($location.absUrl().search('noheader') > -1) {
              return url;
            }
            return url + '?noheader=1';
          }

          // template variables -------------------
          $scope.copySuccess = false;
          $scope.url = scrubUrl();

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
