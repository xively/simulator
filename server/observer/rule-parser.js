'use strict';

// Nools representation of AirSoClean3000
var AirSoClean3000 = require('./nools/AirSoClean3000');
var SalesforceCase = require('./nools/SalesforceCase');

var RuleParser = function(ruleObject) {
  this._ruleObject = ruleObject;

  this.conditions = this._getSingleRule(this._ruleObject.conditions);
  this.action = this._getAction();
  this.name = ruleObject.name;
};

RuleParser.prototype._getAction = function() {
  var actions = this._ruleObject.actions;

  return function(facts, flow) {
    actions.forEach(function(action) {
      switch (action.type) {
        case 'case':

          var dupe = false;
          flow.getFacts(SalesforceCase).forEach(function(SFCase) {
            if (SFCase.caseTitle === action.value) {
              dupe = true;
            }
          });

          if (!dupe) {
            flow.assert(new SalesforceCase(facts.a, action.value));
          }

          break;

        case 'email':
          console.log('new email for', JSON.stringify(facts.a), JSON.stringify(action));
          break;
      }
    });
  };
};


RuleParser.prototype._getSingleRule = function(rule) {
  if (typeof rule.mode !== 'undefined') {
    var transformedRules = [];

    var that = this;
    rule.rules.forEach(function(inputRule) {
      transformedRules.push(that._getSingleRule(inputRule));
    });

    if (rule.mode === 'any') {
      // otherwise, 'all' is implied
      transformedRules = ['or', transformedRules];
    }

    return transformedRules;
  }

  // one horse sized duck, or many duck sized horses?
  // maybe we should make this a bunch of smaller rules
  // we're doing comparisons anyways, and that's what rules are good for

  return [AirSoClean3000, 'a', function(facts) {
    // try/catch?
    var data = parseInt(facts.a.deviceValues[rule.device], 10) || facts.a.deviceValues[rule.device] || '';
    if (typeof data === 'string') {
      data = data.toUpperCase();
    }

    rule.value = rule.value.toUpperCase();
    var values = rule.value.split(',').map(function(value) {
      return parseInt(value, 10);
    });

    var result = false;

    switch (rule.operator) {
      case '$in':
        result = (values.indexOf(data) !== -1);
        break;

      case '$nin':
        result = (values.indexOf(data) === -1);
        break;

      case '$eq':
        result = (data == rule.value);   // eslint-disable-line
        break;

      case '$ne':
        result = (data != rule.value);  // eslint-disable-line
        break;

      case '$gte':
        result = (data >= rule.value);
        break;

      case '$lte':
        result = (data <= rule.value);
        break;

      case '$lt':
        result = (data < rule.value);
        break;

      case '$gt':
        result = (data > rule.value);
        break;

      case '$con':
        result = (data.indexOf(rule.value) > -1);
        break;
    }
    return result;
  }];
};


module.exports = RuleParser;