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
        'Sms',
        function($scope, $timeout, $location, Sms) {

          // template variables -------------------
          $scope.copySuccess = false;
          $scope.url = $location.absUrl().replace('?demo=1', '');
          $scope.phone = null;

          // create clipboard ---------------------
          var clipboard = new Clipboard('.copy-btn');
          clipboard.on('success', function(e) {
            $scope.messageText = 'Copied!';
          });

          // send text ----------------------------
          $scope.sendText = function() {
            var data = {
              'phone': $scope.phone,
              'message': $scope.url
            };

            if (!$scope.phone) {
              $scope.messageText = 'Please enter a number!';
              return;
            }

            Sms.sendMessage(data)
            .then(function(res) {
              $scope.messageText = res.data.message;

            },
            function(err) {
              $scope.messageText = err.data.message;
            });
          };

          // remove modal -------------------------
          $scope.removeModal = function() {
            $scope.closeModal()();
          };

        },
      ],
    };
  },
];
