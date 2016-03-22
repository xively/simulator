/* eslint no-process-exit: 0 */

'use strict';

require('dotenv').load();

var _ = require('lodash');
var bp = require('./blueprint');
var Promise = require('bluebird');
var database = require('../server/database');
var path = require('path');

var SERIAL_PREFIX = 'Purify';
var SERIAL_START = Math.floor(Math.random() * 100000) * 100;
var options = {
  serialPrefix: SERIAL_PREFIX,
  serialStart: SERIAL_START,
  deviceTemplateName: 'AirSoClean3000',
  organizationTemplateName: 'AirSoCleanOrgTmpl' + SERIAL_PREFIX + SERIAL_START,
  organizationName: 'Warehouse',
  userTemplateName: 'AirSoCleanUsrTmpl' + SERIAL_PREFIX + SERIAL_START,
};

var LOCATIONS = [{
  name: 'London',
  lat: 51.5285582,
  lon: -0.2416796
}, {
  name: 'New York',
  lat: 40.7055651,
  lon: -74.1180857
}, {
  name: 'San Francisco',
  lat: 37.7576948,
  lon: -122.4726194
}];

console.error('Provision start');
bp.getEnv(process.env)
  .then(bp.useDemoAccount)
  .then(bp.getJwt)
  .then(bp.getClient)

  .then(bp.createDeviceTemplate(function(body, $) {
    body.name = options.deviceTemplateName;
  }))

  .then(bp.createDeviceFields(_.reduce({
    hardwareVersion: 'string',
    includedSensors: 'string',
    color: 'string',
    productionRun: 'string',
    powerVersion: 'string',
    activatedDate: 'datetime',
    filterType: 'string',
  }, function(bodyArray, fieldType, name) {
    return bodyArray.concat(function(body, $) {
      body.deviceTemplateId = $.deviceTemplate.id;
      body.name = name;
      body.fieldType = fieldType;
    });
  }, [])))

  .then(bp.createChannelTemplates([
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'sensor';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'control';
      body.persistenceType = 'simple';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'device-log';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'temp';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'humidity';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'co';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'dust';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'filter';
      body.persistenceType = 'timeSeries';
    },
    function(body, $) {
      body.entityId = $.deviceTemplate.id;
      body.entityType = 'deviceTemplate';
      body.name = 'fan';
      body.persistenceType = 'simple';
    }
  ]))

  .then(bp.createOrganizationTemplate(function(body, $) {
    body.name = options.organizationTemplateName;
  }))

  .then(bp.createOrganization(function(body, $) {
    body.organizationTemplateId = $.organizationTemplate.id;
    body.name = options.organizationName;
  }))

  .then(bp.createDevices(_(50).range().map(function(n, index) {
    return function(body, $) {
      var loc = LOCATIONS[index % LOCATIONS.length];

      body.deviceTemplateId = $.deviceTemplate.id;
      body.organizationId = $.organization.id;
      body.serialNumber = options.serialPrefix + (options.serialStart + n);
      body.name = body.serialNumber;
      body.hardwareVersion = '2.5.5';
      body.includedSensors = 'Temperature, Humidity, VoC, CO, Dust (PM)';
      body.color = 'white';
      body.productionRun = 'DEC2014';
      body.powerVersion = '12VDC';
      body.filterType = 'carbonHEPA1023';
      body.firmwareVersion = '2.3.1';
      body.latitude = loc.lat;
      body.longitude = loc.lon;
      body.location = loc.name;
    };
  }).value()))

  .then(bp.createEndUserTemplate(function(body, $) {
    body.name = options.userTemplateName;
  }))

  .then(bp.createEndUser(function(body, $) {
    body.organizationTemplateId = $.organizationTemplate.id;
    body.organizationId = $.organization.id;
    body.endUserTemplateId = $.endUserTemplate.id;
  }))

  .then(function($) {
    return bp.createMqttCredentials({
      outputProp: 'mqttDevice',
      body: _($.device).map(function(device) {
        return function(body, $$) {
          body.entityId = device.id;
          body.entityType = 'device';
        };
      }).value(),
    })($);
  })

  .then(bp.createMqttCredentials({
    outputProp: 'mqttUser',
    body: function(body, $) {
      body.entityId = $.endUser.id;
      body.entityType = 'endUser';
    },
  }))

  // Store in PostGRES – for the future!
  .then(function($) {
    var tableScript = path.join(__dirname, 'tables.sql');

    return database.runScriptFile(tableScript)
    .then(function() {
      return Promise.map($.device, function(device) {
        var mqttCredentials = _.find($.mqttDevice, 'entityId', device.id);
        var firmware = {
          id: null,
          serial: device.serialNumber,
          mqttUser: device.id,
          mqttPassword: mqttCredentials.secret,
          associationCode: 'SOMETHINGISMISSING',
          organizationId: device.organizationId,
          deviceId: device.id,
        };

        return database.insertInventory({serial: device.serialNumber})
        .then(function(returnedRows) {
          firmware.id = returnedRows[0].id;
          console.error('Inserted ' + firmware.id);
          return database.insertFirmware(firmware);
        });
      });
    })
    .then(function() {
      // add org and mqtt user to the application_config db
      // this will replace redis
      var appConfig = {
        accountId: $.env.XIVELY_ACCOUNT_ID,
        organization: $.organization,
        mqttUser: $.mqttUser,
        endUser: $.endUser,
        device: $.device[0]
      };
      return database.insertApplicationConfig(appConfig);
    })
    .then(function() {
      return $;
    });
  })
  .then(function(data) {
    // console.log(JSON.stringify(data, null, 2));
    console.error('Provision done');
  })
  .catch(function(err) {
    console.error('Provision error');
    if (err instanceof Error) {
      console.error(err.stack);
    } else {
      console.error(JSON.stringify(err, null, 2));
    }
  })
  .finally(function() {
    process.exit();
  });
