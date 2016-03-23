'use strict';

var angular = require('angular');
require('angular-uuid');

var clamp = require('./values/clamp');
var csvParse = require('./values/csv-parse');
var randomInteger = require('./values/random-integer');
var wiggle = require('./factories/wiggle');
var deviceLogService = require('./factories/device-log-service-factory');
var applicationConfig = require('../../../manage/pods/common/utils/application-config-constant');
var loginProvider = require('../../../manage/pods/common/login-provider');
var BlueprintClientProvider = require('../../../manage/pods/common/blueprint-client-provider');

var commonModule = angular.module('common', ['angular-uuid']);

// utils
// These are handy functions.
commonModule.value('clamp', clamp);
commonModule.value('csvParse', csvParse);
commonModule.value('randomInteger', randomInteger);
commonModule.factory('wiggle', wiggle);
commonModule.factory('deviceLogService', deviceLogService);
commonModule.constant('applicationConfig', applicationConfig);
commonModule.provider('Login', loginProvider);
commonModule.provider('BlueprintClient', BlueprintClientProvider);

module.exports = commonModule;
