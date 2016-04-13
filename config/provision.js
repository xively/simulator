'use strict'

const _ = require('lodash')

const USER_NAMES = ['Jane Smith', 'Tommy Atkins', 'Bob Thompson']

const LOCATIONS = [{
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
}]

const config = {
  organizationTemplates: [{
    name: 'AirSoCleanOrgTmpl1'
  }],
  deviceTemplates: [{
    name: 'AirSoClean3000'
  }],
  endUserTemplates: [{
    name: 'AirSoCleanUsrTmpl1'
  }],
  organizations: [{
    organizationTemplate: 'AirSoCleanOrgTmpl1',
    name: 'Warehouse'
  }],
  deviceFields: [{
    deviceTemplate: 'AirSoClean3000',
    name: 'hardwareVersion',
    fieldType: 'string'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'includedSensors',
    fieldType: 'string'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'color',
    fieldType: 'string'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'productionRun',
    fieldType: 'string'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'powerVersion',
    fieldType: 'string'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'activatedDate',
    fieldType: 'datetime'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'filterType',
    fieldType: 'string'
  }],
  channelTemplates: [{
    deviceTemplate: 'AirSoClean3000',
    name: 'sensor',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'control',
    entityType: 'deviceTemplate',
    persistenceType: 'simple'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'device-log',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'temp',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'humidity',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'co',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'dust',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'filter',
    entityType: 'deviceTemplate',
    persistenceType: 'timeSeries'
  }, {
    deviceTemplate: 'AirSoClean3000',
    name: 'fan',
    entityType: 'deviceTemplate',
    persistenceType: 'simple'
  }],
  devices: _.range(10).map((idx) => {
    const location = _.sample(LOCATIONS)
    return {
      deviceTemplate: 'AirSoClean3000',
      organization: 'Warehouse',
      name: `Purify${idx}`,
      serialNumber: `Purify-${Date.now()}${idx}`,
      hardwareVersion: '2.5.5',
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust (PM)',
      color: 'white',
      productionRun: 'DEC2014',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA1023',
      firmwareVersion: '2.3.1',
      latitude: location.lat,
      longitude: location.lon,
      location: location.name
    }
  }),
  endUsers: _.range(3).map((idx) => ({
    organizationTemplate: 'AirSoCleanOrgTmpl1',
    organization: 'Warehouse',
    endUserTemplate: 'AirSoCleanUsrTmpl1',
    name: _.sample(USER_NAMES)
  }))
}

module.exports = config
