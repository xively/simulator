'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

var getDevices = function(state) {
  var result = state.client.apis.devices.all({
    accountId: state.config.accountId,
    organizationId: state.config.organizationId,
    pageSize: 100,
  })
  .then(function(res) {
    return res.obj.devices.results;
  });

  return Promise.props(_.assign({}, state, {
    devices: result,
  }));
};

var getDeviceTemplates = function(state) {
  var result = state.client.apis.devicesTemplates.all({
    accountId: state.config.accountId,
  })
  .then(function(res) {
    return res.obj.deviceTemplates.results;
  });

  return Promise.props(_.assign({}, state, {
    deviceTemplates: result,
  }));
};

var getOrganization = function(state) {
  var result = state.client.apis.organizations.byId({
    accountId: state.config.accountId,
    id: state.config.organizationId,
  })
  .then(function(res) {
    return res.obj.organization;
  });

  return Promise.props(_.assign({}, state, {
    organization: result,
  }));
};


module.exports = [
  function BlueprintDevices() {
    var options = {};
    this.options = function(_options) {
      options = _options;
    };

    this.$get = [
      'BlueprintClient',
      function(BlueprintClient) {
        return Promise.props({
          client: BlueprintClient.then(function(client) { return client.client; }),
          config: {
            accountId: options.accountId,
            organizationId: options.organizationId,
          },
        })
        .then(getDevices)
        .then(getDeviceTemplates)
        .then(getOrganization)
        .then(function(state) {
          var templateMap = {};
          _.forEach(state.deviceTemplates, function(template) {
            templateMap[template.id] = template;
          });
          return _.map(state.devices, function(device) {
            device.organizationName = state.organization.name;
            device.templateName = templateMap[device.deviceTemplateId].name;
            return device;
          });
        });
      },
    ];
  },
];
