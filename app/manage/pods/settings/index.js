'use strict';

var angular = require('angular');
var template = require('./settings.tmpl');
var commonModule = require('../common');

var settingsModule = angular.module('settings', [
  'ui.router',
  commonModule.name
]);

settingsModule.config(['$stateProvider', function config($stateProvider) {
  $stateProvider.state('settings', {
    url: '/settings',
    template: template,
    controller: 'SettingsController',
    controllerAs: 'settings',
    bindToController: true
  });
}]);

settingsModule.controller('SettingsController', [
  'CONFIG',
  function settingsController(CONFIG) {
    var account = {};
    account['Account ID'] = {
      text: CONFIG.account.accountId
    };
    account.Username = {
      text: CONFIG.account.emailAddress
    };
    account.Password = {
      isPassword: true,
      text: CONFIG.account.password
    };

    var salesforce = {
      Username: {
        text: CONFIG.salesforce.user || 'Not available'
      },
      Password: {
        isPassword: true,
        text: CONFIG.salesforce.pass || 'Not available'
      },
      Secret: {
        isPassword: true,
        text: CONFIG.salesforce.token || 'Not available'
      }
    };

    this.config = {};
    this.config['Xively Account'] = account;
    this.config['Salesforce Settings'] = salesforce;

    this.select = function select(event) {
      var element = event.currentTarget;
      element.select();
      document.execCommand('copy');
    };
  }
]);

module.exports = settingsModule;
