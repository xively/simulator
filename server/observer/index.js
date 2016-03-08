'use strict';

var MqttListener = require('./mqtt-listener');
var RulesEngine = require('./rules');

var Observer = function(database, mqttConfig) {
  this.database = database;
  this.listener = new MqttListener(mqttConfig);

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
      rows.forEach(function(row) {
        that.rules.addDevice(row.deviceId);
        that.listener.addDevice(row.deviceId);
      });
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
    data.sensors = [];

    // Each message can have multiple sensor readings, separated by line
    var lines = data.message.split(/\n/);
    lines.forEach(function(line) {
      // The Xively timeseries format is time,name,value,text
      var cols = line.split(',');
      var name = cols.length > 1 ? cols[1] : '';
      var value = cols.length > 2 ? parseFloat(cols[2]) : -1;

      // Add to array of parsed values
      data.sensors.push({
        // TODO: timestamp from cols[0]
        name: name,
        value: value,
        // TODO: string from cols[3]
      });
    });

    return next();
  });

  // Pass the message data to the rules engine
  this.listener.use('sensor', function(data, next) {

    data.sensors.forEach(function(sensor) {
      that.rules.modify(data.deviceId, sensor.name, sensor.value);
    });

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
