'use strict';

var angular = require('angular');
var rulesFormModule = angular.module('rules-form', []);

rulesFormModule.directive('conditionalForm', require('./conditional-form-directive'));
rulesFormModule.directive('combinationForm', require('./combination-form-directive'));
rulesFormModule.directive('conditionalStatement', require('./conditional-statement-directive'));
rulesFormModule.config([
  '$stateProvider',
  function(stateProvider) {
    stateProvider
      .state('rules-form', {
        url: '/rules-form/:ruleId?',
        template: require('./template.tmpl'),
        controller: [
          '$scope', '$state', '$stateParams', 'RulesData',
          function($scope, $state, $stateParams, rulesFactory) {
            // Data objects ---------------------------------------------
            $scope.caseTypes = {
              'case': {
                'value': '',
                'selected': false
              },
              'opportunity': {
                'value': '',
                'selected': false
              },
              'email': {
                'value': '',
                'selected': false
              }
            };

            $scope.operatorTypes = {
              '$lt': 'Less Than',
              '$lte': 'Less Than or Equal to',
              '$gt': 'Greater Than',
              '$gte': 'Greater Than or Equal to',
              '$eq': 'Equal to',
              '$in': 'Matches Any',
              '$nin': 'Matches None'
            };

            $scope.rule = {
              'conditions': {
                'mode': 'all',
                'rules': []
              },
              'actions': []
            };

            // template variables ----------------------------------
            $scope.title = 'New Rule';
            $scope.actionType = 'Create';
            $scope.failure = false;
            $scope.serverFailure = false;
            $scope.errorMessage = 'Oops. Something went wrong';

            $scope.conditions = $scope.rule.conditions.rules;

            // set up ---------------------------------------------
            if ($stateParams.ruleId) {
              $scope.loading = true;
              $scope.actionType = 'Edit';
              $scope.title = 'Edit Rule';

              rulesFactory.getRule($stateParams.ruleId)
                .then(function(resp) {
                  $scope.rule = JSON.parse(resp.data.ruleConfig);
                  $scope.conditions = $scope.rule.conditions.rules;
                  $scope.loading = false;
                  var ruleActions = $scope.rule.actions;
                  for (var i = 0; i < ruleActions.length; i++) {
                    $scope.caseTypes[ruleActions[i].type].selected = true;
                    $scope.caseTypes[ruleActions[i].type].value = ruleActions[i].value;
                  }
                },
                function() {
                  $scope.serverFailure = false;
                });
            }

            // template functions ---------------------------------------------
            $scope.operatorLabel = function(op) {
              return $scope.operatorTypes[op];
            };

            // data manipulation functions ---------------------------------------------
            $scope.addCondition = function(data) {
              $scope.conditions.push(data);
              // get info from form, add it to $scope.rule
            };

            $scope.deleteCondition = function(index, parentIndex) {
              var conditionArray = $scope.conditions;
              var ruleIndex = index;
              if (parentIndex) {
                if ($scope.conditions[parentIndex].rules.length <= 1) {
                  ruleIndex = parentIndex;
                }
                else {
                  conditionArray = $scope.conditions[parentIndex].rules;
                }
              }

              conditionArray.splice(ruleIndex, 1);
            };

            $scope.setActions = function() {
              var caseTypes = $scope.caseTypes;
              var actions = [];
              for (var key in caseTypes) {
                if (caseTypes[key].selected) {
                  // validation
                  if (!caseTypes[key].value) {
                    return;
                  }
                  actions.push({
                    value: caseTypes[key].value,
                    type: key
                  });
                }
              }
              $scope.rule.actions = actions;
            };


            // Form submit functions ---------------------------------------------
            $scope.formSubmit = function() {
              $scope.setActions();
              if (!$scope.rule.name) {
                $scope.failure = true;
                $scope.errorMessage = 'You need to add a name.';
              }
              else if (!$scope.rule.conditions.rules.length) {
                $scope.failure = true;
                $scope.errorMessage = 'You need at least one condition.';
              }
              else if (!$scope.rule.actions.length) {
                $scope.failure = true;
                $scope.errorMessage = 'You need at least one action.';
              }
              else {
                var formData = {
                  ruleConfig: angular.toJson($scope.rule, true)
                };
                rulesFactory.insertUpdateRule(formData, $stateParams.ruleId)
                .then(function() {
                  $state.go('rules', {
                    newRule: $scope.rule.name,
                    action: $scope.actionType
                  });
                },
                function() {
                  $scope.failure = true;
                  $scope.errorMessage = 'Server error.';
                });
              }
            };

          },
        ],
      });
  },
]);

module.exports = rulesFormModule;
