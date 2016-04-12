'use strict'

const config = {
  organization: {
    name: 'Warehouse'
  },
  organizationTemplate: {
    name: 'AirSoCleanOrgTmpl1'
  },
  userTemplate: {
    name: 'AirSoCleanUsrTmpl1'
  },
  deviceTemplate: {
    name: 'AirSoClean3000'
  },
  deviceFields: [
    {
      name: 'hardwareVersion',
      fieldType: 'string'
    }, {
      name: 'includedSensors',
      fieldType: 'string'
    }, {
      name: 'color',
      fieldType: 'string'
    }, {
      name: 'productionRun',
      fieldType: 'string'
    }, {
      name: 'powerVersion',
      fieldType: 'string'
    }, {
      name: 'activatedDate',
      fieldType: 'datetime'
    }, {
      name: 'filterType',
      fieldType: 'string'
    }
  ],
  channelTemplates: [
    {
      name: 'sensor',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'control',
      entityType: 'deviceTemplate',
      persistenceType: 'simple'
    }, {
      name: 'device-log',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'temp',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'humidity',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'co',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'dust',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'filter',
      entityType: 'deviceTemplate',
      persistenceType: 'timeSeries'
    }, {
      name: 'fan',
      entityType: 'deviceTemplate',
      persistenceType: 'simple'
    }
  ],
  devices: [
    {
      name: 'Purify1',
      serialNumber: 'Purify-1564451654',
      hardwareVersion: '2.5.5',
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust (PM)',
      color: 'white',
      productionRun: 'DEC2014',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA1023',
      firmwareVersion: '2.3.1'
    }
  ]
}

module.exports = config
