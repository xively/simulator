'use strict';

var BlueprintClient = require('../server/vendor/blueprint-client-node.js');
var Promise = require('bluebird');
var request = Promise.promisify(require('request'));
var _ = require('lodash');

// Yield a state object with an "env" property containing a copy of the relevant
// properties from the input env object.
exports.getEnv = function(env) {
  return Promise.resolve({
    env: _.pick(env, function(value, key) {
      return key.indexOf('XIVELY_') === 0;
    }),
  });
};

// Used in testing provisioning via accounts.json file.
exports.useDemoAccount = function($) {
  // Get first account from file.
  var account;
  try {
    account = require('../accounts')[0];
    console.log('Using accounts.json data %j', account);
    // Override env properties.
    $.env.XIVELY_ACCOUNT_ID = account.accountId;
    $.env.XIVELY_APP_ID = account.appId;
    $.env.XIVELY_APP_TOKEN = account.appToken;
    $.env.XIVELY_ACCOUNT_USER_NAME = account.username;
    $.env.XIVELY_ACCOUNT_USER_PASSWORD = account.password;
    $.env.XIVELY_IDM_HOST = 'id.demo.xively.com';
    $.env.XIVELY_BLUEPRINT_HOST = 'blueprint.demo.xively.com';
    $.env.XIVELY_BROKER_HOST = 'broker.demo.xively.com';
    $.env.XIVELY_TIMESERIES_HOST = 'timeseries.demo.xively.com';
  }
  catch (err) {
    // Fail silently.
  }
  return Promise.resolve($);
};

// Authorize with the IdM server and yield a new state object with a "jwt"
// property. Input state object equires "env" property.
exports.getJwt = function($) {
  var options = {
    url: 'https://' + $.env.XIVELY_IDM_HOST + '/api/v1/auth/login-user',
    method: 'POST',
    headers: {
      AccessToken: $.env.XIVELY_APP_TOKEN,
    },
    json: {
      accountId: $.env.XIVELY_ACCOUNT_ID,
      emailAddress: $.env.XIVELY_ACCOUNT_USER_NAME,
      password: $.env.XIVELY_ACCOUNT_USER_PASSWORD,
    },
  };
  var jwt = request(options).then(function(res) {
    if (res.statusCode !== 200) {
      console.error('Error:', res.body.message);
      console.error('Request:', JSON.stringify(options, null, 2));
      console.error('Response:', JSON.stringify(res, null, 2));
      throw new Error(res.body.message);
    }
    return res.body.jwt;
  });

  return Promise.props(_.assign({}, $, {
    jwt: jwt,
  }));
};

// Create a new Blueprint client and yield a new state object with a "client"
// property. Input state object requires "env" and "jwt" properties.
exports.getClient = function($) {
  var client = new BlueprintClient({
    authorization: 'Bearer ' + $.jwt,
    docsUrl: 'https://' + $.env.XIVELY_BLUEPRINT_HOST + '/docs',
  }).ready;

  return Promise.props(_.assign({}, $, {
    client: client,
  }));
};

// Blueprint "create" method factory.
//
// Create a method to export:
//   var createThing = exports.blueprintCreator(defaultOptions);
//
// Consume that method in a Blueprint promise chain:
//
// Use defaults:
//   blueprintPromise.then(createThing()).then(...)
//
// Override defaults:
//   blueprintPromise.then(createThing(overrideDefaults)).then(...)
//
// Override defaults programmatically, based on $:
//   blueprintPromise.then(function($) {
//     return createThing(overrideDefaults)($);
//   }).then(...)

exports.blueprintCreator = function(baseOptions) {
  return function(options) {
    if (typeof options === 'function' || Array.isArray(options)) {
      options = {body: options};
    }
    _.defaults(options, baseOptions);

    // The creator function.
    return function($) {
      function create(optionsBody, current, total) {
        // Generate the POST body, augmenting via specified function or object.
        var body = {
          accountId: $.env.XIVELY_ACCOUNT_ID,
        };
        if (typeof optionsBody === 'function') {
          body = optionsBody(body, $) || body;
        }
        else if (typeof optionsBody === 'object' && optionsBody) {
          _.assign(body, optionsBody);
        }
        // Error if specified method doesn't exist.
        var apiMethod = $.client.apis[options.apiMethod];
        if (!apiMethod) {
          throw new Error('Blueprint method $.client.apis.' + options.apiMethod + ' not found.');
        }
        // Create!
        console.error('API %s.create %d/%d', options.apiMethod, current + 1, total);
        return apiMethod.create({
          body: JSON.stringify(body),
        }).then(function(res) {
          if (options.responseProp in res.obj) {
            return res.obj[options.responseProp];
          }
          console.error('Response object:', res.obj);
          throw new Error('Blueprint (' + options.apiMethod + ') response.obj.' +
              options.responseProp + ' property missing.');
        })
        .catch(function(err) {
          console.error('Request object:', JSON.stringify(body));
          console.error('Error object:', err.obj.error);
          throw new Error('Blueprint (' + options.apiMethod + ') server error: ' + err.obj.error.message);
        });
      }
      // Add creation response into specified property of result object.
      function normalize(value) {
        var result = {};
        var prop = options.outputProp || options.responseProp;
        console.error('Creating $.%s property', prop);
        result[prop] = value;
        return _.assign({}, $, result);
      }
      // If options.body is an array, yield an array of responses.
      if (Array.isArray(options.body)) {
        return Promise.map(options.body, function(optionsBody, n) {
          return create(optionsBody, n, options.body.length);
        }).then(normalize);
      }
      // Otherwise yield a single response object.
      return create(options.body, 0, 1).then(normalize);
    };
  };
};

// Create and get channel templates and yield a new state object with a
// "channelTemplates" property added.
exports.createChannelTemplates = exports.blueprintCreator({
  apiMethod: 'channelsTemplates',
  responseProp: 'channelTemplate',
});

// Create and get a device template and yield a new state object with a
// "deviceTemplate" property added.
exports.createDeviceTemplate = exports.blueprintCreator({
  apiMethod: 'devicesTemplates',
  responseProp: 'deviceTemplate',
});

// Create and get device custom fields and yield a new state object with a
// "deviceField" property added.
exports.createDeviceFields = exports.blueprintCreator({
  apiMethod: 'devicesCustomFields',
  responseProp: 'deviceField',
});

// Create and get devices and yield a new state object with a "device" property
// added.
exports.createDevices = exports.blueprintCreator({
  apiMethod: 'devices',
  responseProp: 'device',
});

// Create and get a organization template and yield a new state object with an
// "organizationTemplate" property added.
exports.createOrganizationTemplate = exports.blueprintCreator({
  apiMethod: 'organizationsTemplates',
  responseProp: 'organizationTemplate',
});

// Create and get an organization and yield a new state object with an
// "organization" property added.
exports.createOrganization = exports.blueprintCreator({
  apiMethod: 'organizations',
  responseProp: 'organization',
});

// Create and get an end user template and yield a new state object with an
// "endUserTemplate" property added.
exports.createEndUserTemplate = exports.blueprintCreator({
  apiMethod: 'endUsersTemplates',
  responseProp: 'endUserTemplate',
});

// Create and get an end user and yield a new state object with an "endUser"
// property added.
exports.createEndUser = exports.blueprintCreator({
  apiMethod: 'endUsers',
  responseProp: 'endUser',
});

// Create and get device mqtt credentials and yield a new state object with an
// "mqtt" property added.
exports.createMqttCredentials = exports.blueprintCreator({
  apiMethod: 'accessMqttCredentials',
  responseProp: 'mqttCredential',
});

// Get all devices and yield a new state object with a "devices" property. Input
// state object requires "env" and "client" properties.
exports.getDevices = function($) {
  var devices = $.client.apis.devices.all({
    accountId: $.env.XIVELY_ACCOUNT_ID,
  }).then(function(res) {
    return res.obj.devices.results;
  });

  return Promise.props(_.assign({}, $, {
    devices: devices,
  }));
};

// Get first device and yield a new state object with a "device" property. Input
// state object requires "env" and "client" properties.
exports.getDevice = function($) {
  var device = exports.getDevices($).then(function($$) {
    return $$.devices[0];
  });
  return Promise.props(_.assign({}, $, {
    device: device,
  }));
};
