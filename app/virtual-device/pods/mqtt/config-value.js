'use strict';

var _ = require('lodash');
var config = require('./config');
config = _.get(config, 'virtualdevice.mqtt') || {};

var mqttConfig = {
  broker: config.mqttBroker,
  port: Number(config.mqttWsPort),
  useSSL: config.mqttUseSSL
};

module.exports = mqttConfig;
