'use strict';

require('dotenv').load();

var _ = require('lodash');
var database = require('../server/database');
var Mqtt = require('../server/observer');
var config = require('../server/config');

var mqttConfig = {
  host: 'mqtt://' + config.account.brokerHost,
  clientId: config.account.device.mqtt.username,
  username: config.account.device.mqtt.username,
  password: config.account.device.mqtt.password,
  accountId: config.account.accountId
};

// Per-sensor constraints.
var sensorValues = {
  co: {
    min: 0,
    max: 500,
    initial: 25,
    wiggle: 0.01
  },
  dust: {
    min: 0,
    max: 500,
    wiggle: 0.01,
    initial: 1
  },
  humidity: {
    min: 0,
    max: 100,
    wiggle: 0.03,
    initial: 20
  },
  temp: {
    min: -40,
    max: 125,
    wiggle: 0.02,
    initial: 26
  },
  aqi: {
    min: 0,
    max: 100,
    wiggle: 0.02,
    initial: 20,
  }
};

function generateSensorValue(sensorValue) {
  sensorValue.current = sensorValue.current ?
    (sensorValue.max - sensorValue.min) * sensorValue.wiggle * _.sample([1, -1]) + sensorValue.current :
    sensorValue.initial;

  return Math.min(sensorValue.max, Math.max(sensorValue.min, _.round(sensorValue.current)));
}

function generateSensorData(timestamp) {
  var text = _.reduce(sensorValues, function(prev, value, key) {
    prev.push((key === 'co' ? '' : '\n') + timestamp);
    prev.push(key);
    prev.push(generateSensorValue(value));

    return prev;
  }, []);

  return text.join(',');
}

function generateData() {
  var mqtt = new Mqtt(database, mqttConfig);
  var now = Date.now();

  _.times(30, function(count) {
    var timestamp = now - count * 10000;
    var sensorData = generateSensorData(timestamp);
    console.log('count:', count, 'message:', sensorData);
    mqtt.listener.queueMessage(sensorData);
  });

  return mqtt.listener._finished;
}

module.exports = {
  generateData: generateData
};
