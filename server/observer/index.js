'use strict';

var MqttListener = require('./mqtt-listener');
var RulesEngine = require('./rules');
var logParser = require('./log-parser');
var _ = require('lodash');

var Observer = function(database, mqttConfig, deviceId) {
  this.database = database;
  this.listener = new MqttListener(mqttConfig);
  this.deviceId = deviceId;

  this._startRules();
};

Observer.prototype._startRules = function() {
  var that = this;
  this.database.selectRules()
  .then(function(rows) {
    var rulesList = rows.map(function(row) {
      return JSON.parse(row.ruleConfig);
    });

    that.rules = new RulesEngine(rulesList);
  })
  .then(function() {
    return that.database.selectFirmwares();
  })
  .then(function(rows) {
    if (rows.length > 0) {
      var row = _.find(rows, (item) => item.deviceId === that.deviceId);
      if (row) {
        that.rules.addDevice(row.deviceId);
        that.listener.addDevice(row.deviceId);
      } else {
        console.log('No device were found at id: ' + that.deviceId);
      }
    } else {
      console.log('No devices to connect');
    }
  })
  .catch(function(err) {
    console.error(err);
    console.error(err.stack);
    console.log('An error occurred\n\n', JSON.stringify(err));
  });

  this._setupRoutes();
};

Observer.prototype._setupRoutes = function() {
  var that = this;
  // Parse the xively timeseries format message
  // TODO: This parser becomes part of mqtt-listener
  this.listener.use('sensor', function(data, next) {
    // Each message can have multiple sensor readings, separated by line
    var lines = data.message.split(/\n/);
    var measurements = [];
    lines.forEach(function(line) {
      // The Xively timeseries format is time,name,value,text
      var cols = line.split(',');
      var name = cols.length > 1 ? cols[1] : '';
      var value = cols.length > 2 ? parseFloat(cols[2]) : -1;

      // Add to array of parsed values
      measurements.push({
        // TODO: timestamp from cols[0]
        name: name,
        value: value
        // TODO: string from cols[3]
      });
    });
  // Pass the message data to the rules engine
    that.rules.modify(data.deviceId, measurements);

    return next();
  });

  this.listener.use('device-log', function(data, next) { // TODO: config
    var measurements = logParser(data);
    that.rules.modify(data.deviceId, measurements);
    return next();
  });

};

Observer.prototype.resetRules = function() {
  var that = this;
  return this.database.selectRules()
  .then(function(rows) {
    var rulesList = rows.map(function(row) {
      return JSON.parse(row.ruleConfig);
    });

    that.rules.resetRules(rulesList);
  });
};

module.exports = Observer;
