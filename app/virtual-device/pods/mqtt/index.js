'use strict';

var angular = require('angular');
var _ = require('lodash');

var mqttConfig = require('./config-value');
var mqtt = require('./factory');
var mqttService = require('./service-provider');
var config = require('./config');
var userInfo = _.get(config, 'virtualdevice.userInfo') || {};

var mqttModule = angular.module('mqtt', []);

mqttModule.value('mqttConfig', mqttConfig);
mqttModule.value('userInfo', userInfo);

// MQTT
// These providers manage communications over MQTT
mqttModule.factory('mqtt', mqtt);

mqttModule.provider('mqttService', mqttService);

module.exports = mqttModule;
