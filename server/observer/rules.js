/* eslint-disable */

'use strict';

var nools = require('nools');
var RuleParser = require('./rule-parser');

// Nools representation of AirSoClean3000
var AirSoClean3000 = require('./nools/AirSoClean3000');

// if all fields are not false we have a full picture?
// if sf case date in the past and filter reset or life increase

var ConcariaRules = function(rules) {
  this._makeFlow(rules);
  this._sessions = {};
};

ConcariaRules.prototype._makeFlow = function(rules) {
  this._flow = nools.flow('ConcariaRules', function(flow) {
    rules.forEach(function(rule) {
      var noolsRule = new RuleParser(rule);

      flow.rule(noolsRule.name, noolsRule.conditions, noolsRule.action);
    });
  });
};

ConcariaRules.prototype.addDevice = function(deviceId) {
  var session = this._flow.getSession();
  session.assert(new AirSoClean3000(deviceId));

  var that = this;
  session.matchUntilHalt(function(err) {
    // halt was invoked?
    if (err) {
      console.log(err.stack);

      session.dispose();
      that.addDevice(deviceId);
      return;
    }
  });

  this._sessions[deviceId] = session;
};

ConcariaRules.prototype.resetRules = function(newRules) {
  nools.deleteFlow(this._flow);
  this._makeFlow(newRules);
  for (var deviceId in this._sessions) {
    // a = this._sessions[deviceId].getFacts();
    // console.log(a);
    this._sessions[deviceId].dispose();
    this.addDevice(deviceId);
  }
};

ConcariaRules.prototype.modify = function(deviceId, device, value) {
  var session = this._sessions[deviceId];
  var fact = session.getFacts(AirSoClean3000)[0];
  fact.set(device, value);
  session.modify(fact);
};

module.exports = ConcariaRules;
