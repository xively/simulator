'use strict'

const _ = require('lodash')
const faker = require('faker')
const geojsonUtils = require('geojson-utils')
const geojsonExtent = require('geojson-extent')
const geojsonRandom = require('geojson-random')
const map = require('./map')

const NAMES = {
  HOME_ORG_TEMPLATE: 'Home',
  HOME_DEVICE_TEMPLATE: 'Home Air Purifier',
  HOME_USER: 'Home User',
  WAREHOUSE_ORG_TEMPLATE: 'Warehouse',
  FACTORY_ORG_TEMPLATE: 'Factory',
  COMMERCIAL_DEVICE_TEMPLATE: 'Industrial HVAC',
  COMMERCIAL_OPERATIONS_MANAGER: 'Operations Manager',
  COMMERCIAL_SERVICE_TECHNICIAN: 'Service Technician'
}

/*
 * organizations
 */

const homeOrganizations = _.times(5, (idx) => ({
  organizationTemplate: NAMES.HOME_ORG_TEMPLATE,
  name: `${NAMES.HOME_ORG_TEMPLATE}-${idx + 1}`
}))

const warehouseOrganizations = _.times(3, (idx) => ({
  organizationTemplate: NAMES.WAREHOUSE_ORG_TEMPLATE,
  name: `${NAMES.WAREHOUSE_ORG_TEMPLATE}-${idx + 1}`
}))

const factoryOrganizations = _.times(3, (idx) => ({
  organizationTemplate: NAMES.FACTORY_ORG_TEMPLATE,
  name: `${NAMES.FACTORY_ORG_TEMPLATE}-${idx + 1}`
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

function getLocation () {
  const feature = _.sample(map.features)
  const bbox = geojsonExtent(feature)
  const coordinates = geojsonRandom.position(bbox)
  if (geojsonUtils.pointInMultiPolygon({ coordinates }, feature.geometry)) {
    return coordinates
  }
  return getLocation()
}

const homeDevices = _.reduce(homeOrganizations, (devices, organization, orgIdx) => {
  const DEVICES_PER_ORGANIZATION = 3
  return _.times(DEVICES_PER_ORGANIZATION, (idx) => {
    const location = getLocation()
    return {
      deviceTemplate: NAMES.HOME_DEVICE_TEMPLATE,
      organization: organization.name,
      name: `${NAMES.HOME_DEVICE_TEMPLATE.replace(/\s/g, '-')}-${idx}`,
      serialNumber: `${NAMES.HOME_DEVICE_TEMPLATE.replace(/\s/g, '-')}-${_.padStart(DEVICES_PER_ORGANIZATION * orgIdx + idx + 1, 6, '0')}`,
      hardwareVersion: `1.1.${idx}`,
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust, Filter',
      color: 'white',
      productionRun: 'DEC2016',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA',
      firmwareVersion: `2.0.${idx}`,
      longitude: location[0],
      latitude: location[1]
    }
  }).concat(devices)
}, [])

const commercialDevices = _.reduce(warehouseOrganizations, (devices, organization, orgIdx) => {
  const DEVICES_PER_ORGANIZATION = 10
  return _.times(DEVICES_PER_ORGANIZATION, (idx) => {
    const location = getLocation()
    return {
      deviceTemplate: NAMES.COMMERCIAL_DEVICE_TEMPLATE,
      organization: organization.name,
      name: `${NAMES.COMMERCIAL_DEVICE_TEMPLATE.replace(/\s/g, '-')}-${idx}`,
      serialNumber: `${NAMES.COMMERCIAL_DEVICE_TEMPLATE.replace(/\s/g, '-')}-${_.padStart(DEVICES_PER_ORGANIZATION * orgIdx + idx + 1, 6, '0')}`,
      hardwareVersion: `1.1.${idx}`,
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust, Filter',
      color: 'white',
      productionRun: 'DEC2016',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA',
      firmwareVersion: `2.0.${idx}`,
      longitude: location[0],
      latitude: location[1]
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
    name: faker.name.findName()
  })).concat(users)
}, [])

const commercialUsers = _.reduce(warehouseOrganizations, (users, organization) => {
  return _.times(2, (idx) => ({
    organizationTemplate: organization.organizationTemplate,
    organization: organization.name,
    endUserTemplate: NAMES.COMMERCIAL_SERVICE_TECHNICIAN,
    name: faker.name.findName()
  }))
  .concat([{
    organizationTemplate: organization.organizationTemplate,
    organization: organization.name,
    endUserTemplate: NAMES.COMMERCIAL_OPERATIONS_MANAGER,
    name: faker.name.findName()
  }])
  .concat(users)
}, [])

const config = {
  organizationTemplates: [{
    name: NAMES.HOME_ORG_TEMPLATE
  }, {
    name: NAMES.WAREHOUSE_ORG_TEMPLATE
  }, {
    name: NAMES.FACTORY_ORG_TEMPLATE
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
  organizations: [].concat(homeOrganizations).concat(warehouseOrganizations).concat(factoryOrganizations),
  deviceFields: [].concat(homeDeviceFields).concat(commercialDeviceFields),
  channelTemplates: [].concat(homeDeviceChannels).concat(commercialDeviceChannels),
  devices: [].concat(homeDevices).concat(commercialDevices),
  endUsers: [].concat(homeUsers).concat(commercialUsers)
}

module.exports = config
