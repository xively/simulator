'use strict';
var _ = require('lodash');

var sensorOptions = [{id: 'temp', displayName: 'Temperature'},
  {id: 'humidity', displayName: 'Humidity'},
  {id: 'no2', displayName: 'NO2'},
  {id: 'co', displayName: 'CO'},
  {id: 'dust', displayName: 'Dust'},
  {id: 'filter', displayName: 'Filter'},
  {id: 'fan', displayName: 'Fan'}];
var logOptions = [{id: 'sourceId', displayName: 'Source Id'},
  {id: 'code', displayName: 'Code'},
  {id: 'message', displayName: 'Message'},
  {id: 'details', displayName: 'Details'},
  {id: 'severity', displayName: 'Severity'},
  {id: 'tags', displayName: 'Tags'}];

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
        scope.getComparator = function(topic) {
          scope.comparatorOptions = topic === 'sensor' ? sensorOptions : logOptions;
        };
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
        scope.getComparator(scope.rule.topic);

        scope.editCondition = function() {
          scope.editMode = !scope.editMode;
          scope.editting = !scope.editting;
          scope.listMode = !scope.listMode;
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
