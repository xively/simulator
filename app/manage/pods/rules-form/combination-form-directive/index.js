'use strict';
var _ = require('lodash');

module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      scope: {
        condition: '=?',
        deleteRule: '&',
        parentIndex: '=?',
        conditions: '=?',
      },
      link: function(scope, elm, attrs) {
        scope.showConditionalForm = false;

        scope.operatorTypes = {
          '$lt': 'Less Than',
          '$lte': 'Less Than or Equal to',
          '$gt': 'Greater Than',
          '$gte': 'Greater Than or Equal to',
          '$eq': 'Equal to',
          '$in': 'Matches Any',
          '$nin': 'Matches None'
        };

        scope.addNewCombinationRule = function(data) {
          scope.condition.rules.push(data);
          // if conditions is passed then it means this is a new combination form
          if (scope.conditions) {
            var newCondition = _.cloneDeep(scope.condition);
            scope.conditions.push(newCondition);
            scope.cleanup();
          }
          scope.toggleProperty('showConditionalForm');
        };

        scope.cleanup = function() {
          scope.condition = null;
        };

        scope.deleteCondition = function(index, parentIndex) {
          scope.deleteRule()(index, scope.parentIndex);
        };

        scope.operatorLabel = function(op) {
          return scope.operatorTypes[op];
        };

        scope.showForm = function() {
          // if conditions is passed then it means this is a new combination form
          if (scope.conditions) {
            scope.condition = {
              'mode': 'any',
              'rules': []
            };
          }
          scope.toggleProperty('showConditionalForm');
        };

        scope.toggleProperty = function(type) {
          scope[type] = !scope[type];
        };

      },
    };
  },
];