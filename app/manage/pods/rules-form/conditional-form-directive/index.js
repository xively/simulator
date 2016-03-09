'use strict';
var _ = require('lodash');

module.exports = [
  function() {
    return {
      restrict: 'E',
      template: require('./template.tmpl'),
      scope: {
        addConditional: '&',
        deleteRule: '&',
        editMode: '=?',
        rule: '=?',
        listMode: '=?',
        index: '=?',
        parentIndex: '=?'
      },
      link: function(scope, elm, attrs) {
        scope.disableForm = true;
        scope.editting = false;
        if (!scope.rule) {
          scope.rule = {
            'topic': 'sensor',
            'device': 'temp',
            'operator': '$eq',
            'value': null
          };
        }

        scope.toggleProperty = function(type) {
          scope[type] = !scope[type];
        };

        scope.editCondition = function() {
          scope.toggleProperty('editMode');
          scope.toggleProperty('editting');
          scope.toggleProperty('listMode');
        };

        scope.deleteCondition = function(index, parentIndex) {
          scope.deleteRule()(index, scope.parentIndex);
        };

        scope.callUpdate = function() {
          var data = _.cloneDeep(scope.rule);
          if (data.device && data.value) {
            scope.addConditional()(data);
            // cleanup
            scope.rule.value = null;
            scope.rule.device = 'temp';
          } else {
            scope.errorvalue = !data.value;
            scope.errordevice = !data.device;
          }
        };
      },
    };
  },
];
