'use strict';

var angular = require('angular');

var commonModule = require('../../common');
var mqttModule = require('../../mqtt');

var sensorProps = require('./props-value');
var filterDepletion = require('./filter-depletion-factory');
var propWiggle = require('./prop-wiggle-factory');
var cycleFan = require('./cycle-fan-factory');
var sensorStore = require('./store-factory');
var mqttDeviceInfoPublisher = require('./device-info-publisher-factory');
var mqttSensorPublisher = require('./publisher-factory');
var purifierFanService = require('./fan-service-factory');
var periodicSensorUpdate = require('./periodic-update-factory');
var purifierResettingService = require('./purifier-resetting-service-factory');
var controlChannelSubscription = require('./control-channel-subscription-factory');

// This is the main module. It's for the visualiation of what
// the device is registering.
var purifierSensorModule = angular.module('purifier.sensor', [
  commonModule.name,
  mqttModule.name,
]);

// virtual-state
// Providers that change or store the internal state of the device
purifierSensorModule.value('sensorProps', sensorProps);
purifierSensorModule.factory('filterDepletion', filterDepletion);
purifierSensorModule.factory('propWiggle', propWiggle);
purifierSensorModule.factory('cycleFan', cycleFan);
purifierSensorModule.factory('sensorStore', sensorStore);

// pub-sub
// These providers manage communications over MQTT
purifierSensorModule.factory('mqttDeviceInfoPublisher',
  mqttDeviceInfoPublisher);
purifierSensorModule.factory('mqttSensorPublisher', mqttSensorPublisher);
purifierSensorModule.factory('controlChannelSubscription', controlChannelSubscription);
purifierSensorModule.factory('purifierFanService', purifierFanService);
purifierSensorModule.factory('periodicSensorUpdate', periodicSensorUpdate);
purifierSensorModule.factory('purifierResettingService', purifierResettingService);

module.exports = purifierSensorModule;
