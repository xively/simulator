'use strict'

const _ = require('lodash')

const NAMES = {
  HOME_ORG_TEMPLATE: 'Home',
  HOME_DEVICE_TEMPLATE: 'HomeAirPurifier',
  HOME_USER: 'User',
  COMMERCIAL_ORG_TEMPLATE: 'Commercial',
  COMMERCIAL_DEVICE_TEMPLATE: 'Industrial HVAC',
  COMMERCIAL_OPERATIONS_MANAGER: 'Operations Manager',
  COMMERCIAL_SERVICE_TECHNICIAN: 'Service Technician'
}

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

/*
 * organizations
 */

const homeOrganizations = _.times(5, (idx) => ({
  organizationTemplate: NAMES.HOME_ORG_TEMPLATE,
  name: `${NAMES.HOME_ORG_TEMPLATE}-${idx}`
}))

const commercialOrganizations = _.times(3, (idx) => ({
  organizationTemplate: NAMES.COMMERCIAL_ORG_TEMPLATE,
  name: `${NAMES.COMMERCIAL_ORG_TEMPLATE}-${idx}`
}))

/*
 * device fields
 */

const homeDeviceFields = _.map({
  hardwareVersion: 'string',
  includedSensors: 'string',
  color: 'string',
  productionRun: 'string',
  powerVersion: 'string',
  activatedDate: 'datetime',
  filterType: 'string'
}, (fieldType, name) => ({
  name,
  fieldType,
  deviceTemplate: NAMES.HOME_DEVICE_TEMPLATE
}))

const commercialDeviceFields = _.map({
  hardwareVersion: 'string',
  includedSensors: 'string',
  color: 'string',
  productionRun: 'string',
  powerVersion: 'string',
  activatedDate: 'datetime',
  filterType: 'string'
}, (fieldType, name) => ({
  name,
  fieldType,
  deviceTemplate: NAMES.COMMERCIAL_DEVICE_TEMPLATE
}))

/*
 * device channels
 */

const homeDeviceChannels = _.map({
  control: 'simple',
  humidity: 'simple',
  fan: 'simple',
  temp: 'timeSeries',
  co: 'timeSeries',
  dust: 'timeSeries',
  filter: 'timeSeries'
}, (persistenceType, name) => ({
  name,
  persistenceType,
  entityType: 'deviceTemplate',
  deviceTemplate: NAMES.HOME_DEVICE_TEMPLATE
}))

const commercialDeviceChannels = _.map({
  control: 'simple',
  humidity: 'simple',
  fan: 'simple',
  temp: 'timeSeries',
  co: 'timeSeries',
  dust: 'timeSeries',
  filter: 'timeSeries'
}, (persistenceType, name) => ({
  name,
  persistenceType,
  entityType: 'deviceTemplate',
  deviceTemplate: NAMES.COMMERCIAL_DEVICE_TEMPLATE
}))

/*
 * devices
 */

const homeDevices = _.reduce(homeOrganizations, (devices, organization) => {
  return _.times(3, (idx) => {
    const location = _.sample(LOCATIONS)
    return {
      deviceTemplate: NAMES.HOME_DEVICE_TEMPLATE,
      organization: organization.name,
      name: `${organization.name}-${NAMES.HOME_DEVICE_TEMPLATE}-${idx}`,
      serialNumber: `${organization.name}-${Date.now()}${idx}`,
      hardwareVersion: `1.1.${idx}`,
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust, Filter',
      color: 'white',
      productionRun: 'DEC2016',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA',
      firmwareVersion: `2.0.${idx}`,
      latitude: location.lat,
      longitude: location.lon,
      location: location.name
    }
  }).concat(devices)
}, [])

const commercialDevices = _.reduce(commercialOrganizations, (devices, organization) => {
  return _.times(10, (idx) => {
    const location = _.sample(LOCATIONS)
    return {
      deviceTemplate: NAMES.COMMERCIAL_DEVICE_TEMPLATE,
      organization: organization.name,
      name: `${organization.name}-${NAMES.COMMERCIAL_DEVICE_TEMPLATE}-${idx}`,
      serialNumber: `${organization.name}-${Date.now()}${idx}`,
      hardwareVersion: `1.1.${idx}`,
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust, Filter',
      color: 'white',
      productionRun: 'DEC2016',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA',
      firmwareVersion: `2.0.${idx}`,
      latitude: location.lat,
      longitude: location.lon,
      location: location.name
    }
  }).concat(devices)
}, [])

/*
 * users
 */

const homeUsers = _.reduce(homeOrganizations, (users, organization) => {
  return _.times(2, (idx) => ({
    organizationTemplate: organization.organizationTemplate,
    organization: organization.name,
    endUserTemplate: NAMES.HOME_USER,
    name: _.sample(USER_NAMES)
  })).concat(users)
}, [])

const commercialUsers = _.reduce(commercialOrganizations, (users, organization) => {
  return _.times(2, (idx) => ({
    organizationTemplate: organization.organizationTemplate,
    organization: organization.name,
    endUserTemplate: NAMES.COMMERCIAL_SERVICE_TECHNICIAN,
    name: _.sample(USER_NAMES)
  }))
  .concat([{
    organizationTemplate: organization.organizationTemplate,
    organization: organization.name,
    endUserTemplate: NAMES.COMMERCIAL_OPERATIONS_MANAGER,
    name: _.sample(USER_NAMES)
  }])
  .concat(users)
}, [])

const config = {
  organizationTemplates: [{
    name: NAMES.HOME_ORG_TEMPLATE
  }, {
    name: NAMES.COMMERCIAL_ORG_TEMPLATE
  }],
  deviceTemplates: [{
    name: NAMES.HOME_DEVICE_TEMPLATE
  }, {
    name: NAMES.COMMERCIAL_DEVICE_TEMPLATE
  }],
  endUserTemplates: [{
    name: NAMES.HOME_USER
  }, {
    name: NAMES.COMMERCIAL_OPERATIONS_MANAGER
  }, {
    name: NAMES.COMMERCIAL_SERVICE_TECHNICIAN
  }],
  organizations: [].concat(homeOrganizations).concat(commercialOrganizations),
  deviceFields: [].concat(homeDeviceFields).concat(commercialDeviceFields),
  channelTemplates: [].concat(homeDeviceChannels).concat(commercialDeviceChannels),
  devices: [].concat(homeDevices).concat(commercialDevices),
  endUsers: [].concat(homeUsers).concat(commercialUsers)
}

module.exports = config
