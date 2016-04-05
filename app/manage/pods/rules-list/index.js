'use strict';

var angular = require('angular');
var rulesListModule = angular.module('rules-list', []);
var _ = require('lodash');
rulesListModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('rules', {
        url: '/rules',
        params: {
          newRule: null,
          action: null
        },
        template: require('./template.tmpl'),
        controller: [
          '$scope', '$state', '$stateParams', '$timeout', 'RulesData',
          function($scope, $state, $stateParams, $timeout, rulesFactory) {
            // State -----------------------------
            $scope.loading = true;
            $scope.rules = [];
            $scope.showSuccess = false;
            $scope.showNewRule = $stateParams.newRule;
            $scope.showFailure = false;

            // alerts
            $scope.alertType = '';
            $scope.message = '';

            // reset alerts if needed
            $scope.resetAlerts = function() {
              $scope.alertType = '';
              $scope.message = '';
              $scope.showSuccess = false;
              $scope.showFailure = false;
              $scope.showNewRule = false;
            };

            // hide new rule alert
            if ($scope.showNewRule) {
              $scope.alertType = 'success';
              if ($stateParams.action === 'Create') {
                $scope.message = $stateParams.newRule + ' has been created.';
              } else {
                $scope.message = $stateParams.newRule + ' has been edited.';
              }

            }

            // get data -----------------------------
            rulesFactory.getRules().then(function(resp) {
              $scope.loading = false;

              $scope.rules = _.map(resp.data, function(rule) {
                rule.ruleConfig = JSON.parse(rule.ruleConfig);
                return rule;
              });
            });

            // link to rule edit form -----------------------------
            $scope.showRule = function(index) {
              $state.go('rules-form', {
                ruleId: index,
              });
            };

            // delete -----------------------------
            $scope.deleteRule = function(index, $index) {
              if (window.confirm('Do you want to delete this rule?') === true) {
                rulesFactory.deleteRule(index)
                  .then(function() {
                    $scope.rules.splice($index, 1);
                    $scope.showSuccess = true;
                    $scope.alertType = 'success';
                    $scope.message = 'Rule successfully deleted.';
                  },
                  function() {
                    $scope.showFailure = true;
                    $scope.alertType = 'error';
                    $scope.message = 'Something went wrong';
                  });
              }
            };
          },
        ],
      });
  },
]);


module.exports = rulesListModule;
