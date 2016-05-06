'use strict'

const _ = require('lodash')
const faker = require('faker')
const geojsonUtils = require('geojson-utils')
const geojsonExtent = require('geojson-extent')
const geojsonRandom = require('geojson-random')
const map = require('./map')

const NAMES = {
  HOME_ORG_TEMPLATE: 'Home',
  HOME_AIR_PUTIFIER: 'Home Air Purifier',
  JACKET: 'Jacket',
  SOLAR_PANEL: 'Solar Panel',
  HOME_USER: 'Home User',
  WAREHOUSE_ORG_TEMPLATE: 'Warehouse',
  FACTORY_ORG_TEMPLATE: 'Factory',
  INDUSTRIAL_HVAC: 'Industrial HVAC',
  COMMERCIAL_OPERATIONS_MANAGER: 'Operations Manager',
  COMMERCIAL_SERVICE_TECHNICIAN: 'Service Technician'
}

const DEVICES_PER_ORGANIZATION = {
  HOME_AIR_PUTIFIER: 3,
  INDUSTRIAL_HVAC: 10,
  JACKET: 1,
  SOLAR_PANEL: 1
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
  deviceTemplate: NAMES.HOME_AIR_PUTIFIER
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
  deviceTemplate: NAMES.INDUSTRIAL_HVAC
}))

const jacketDeviceFields = _.map({
  hardwareVersion: 'string',
  includedSensors: 'string',
  color: 'string',
  productionRun: 'string',
  activatedDate: 'datetime'
}, (fieldType, name) => ({
  name,
  fieldType,
  deviceTemplate: NAMES.JACKET
}))

const solarPanelDeviceFields = _.map({
  hardwareVersion: 'string',
  includedSensors: 'string',
  color: 'string',
  weather: 'text',
  productionRun: 'string',
  activatedDate: 'datetime'
}, (fieldType, name) => ({
  name,
  fieldType,
  deviceTemplate: NAMES.SOLAR_PANEL
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
  deviceTemplate: NAMES.HOME_AIR_PUTIFIER
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
  deviceTemplate: NAMES.INDUSTRIAL_HVAC
}))

const jacketDeviceChannels = _.map({
  control: 'simple',
  core: 'timeSeries',
  'left-arm': 'timeSeries',
  'right-arm': 'timeSeries'
}, (persistenceType, name) => ({
  name,
  persistenceType,
  entityType: 'deviceTemplate',
  deviceTemplate: NAMES.JACKET
}))

const solarPanelDeviceChannels = _.map({
  control: 'simple',
  power: 'timeSeries',
  voltage: 'timeSeries',
  current: 'timeSeries',
  irradiance: 'timeSeries'
}, (persistenceType, name) => ({
  name,
  persistenceType,
  entityType: 'deviceTemplate',
  deviceTemplate: NAMES.SOLAR_PANEL
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

function generateGenericDevice (options) {
  options = options || {}
  const templateName = options.templateName
  const idx = options.idx
  const organization = options.organization || {}
  const orgIdx = _.isNumber(options.orgIdx) ? options.orgIdx : 100
  const name = options.name || `${(NAMES[templateName] || '').replace(/\s/g, '-')}-${idx}`
  const serialNumber = options.serialNumber || `${(NAMES[templateName] || '').replace(/\s/g, '-')}-${_.padStart(DEVICES_PER_ORGANIZATION[templateName] * orgIdx + idx + 1, 6, '0')}`
  const deviceTemplateId = options.deviceTemplateId

  const location = getLocation()
  return {
    name,
    serialNumber,
    deviceTemplateId,
    deviceTemplate: NAMES[templateName],
    organization: organization.name,
    organizationId: organization.id,
    color: 'white',
    productionRun: 'DEC2016',
    hardwareVersion: '1.1.1',
    firmwareVersion: '2.0.0',
    longitude: location[0],
    latitude: location[1]
  }
}

const rawDevices = [{
  name: NAMES.HOME_AIR_PUTIFIER,
  count: DEVICES_PER_ORGANIZATION.HOME_AIR_PUTIFIER,
  organizations: homeOrganizations,
  generate: (options) => {
    const generic = generateGenericDevice(Object.assign({ templateName: 'HOME_AIR_PUTIFIER' }, options || {}))
    return _.merge(generic, {
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust, Filter',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA'
    })
  }
}, {
  name: NAMES.JACKET,
  count: DEVICES_PER_ORGANIZATION.JACKET,
  organizations: homeOrganizations,
  generate: (options) => {
    const generic = generateGenericDevice(Object.assign({ templateName: 'JACKET' }, options || {}))
    return _.merge(generic, {
      includedSensors: 'Core, Left arm, Right arm'
    })
  }
}, {
  name: NAMES.INDUSTRIAL_HVAC,
  count: DEVICES_PER_ORGANIZATION.INDUSTRIAL_HVAC,
  organizations: warehouseOrganizations,
  generate: (options) => {
    const generic = generateGenericDevice(Object.assign({ templateName: 'INDUSTRIAL_HVAC' }, options || {}))
    return _.merge(generic, {
      includedSensors: 'Temperature, Humidity, VoC, CO, Dust, Filter',
      powerVersion: '12VDC',
      filterType: 'carbonHEPA'
    })
  }
}, {
  name: NAMES.SOLAR_PANEL,
  count: DEVICES_PER_ORGANIZATION.SOLAR_PANEL,
  organizations: warehouseOrganizations,
  generate: (options) => {
    const generic = generateGenericDevice(Object.assign({ templateName: 'SOLAR_PANEL' }, options || {}))
    return _.merge(generic, {
      includedSensors: 'Power, Voltage, Current, Irradiance'
    })
  }
}]

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
    name: NAMES.HOME_AIR_PUTIFIER
  }, {
    name: NAMES.INDUSTRIAL_HVAC
  }, {
    name: NAMES.JACKET
  }, {
    name: NAMES.SOLAR_PANEL
  }],
  endUserTemplates: [{
    name: NAMES.HOME_USER
  }, {
    name: NAMES.COMMERCIAL_OPERATIONS_MANAGER
  }, {
    name: NAMES.COMMERCIAL_SERVICE_TECHNICIAN
  }],
  organizations: [].concat(homeOrganizations).concat(warehouseOrganizations).concat(factoryOrganizations),
  deviceFields: [].concat(homeDeviceFields).concat(commercialDeviceFields).concat(jacketDeviceFields).concat(solarPanelDeviceFields),
  channelTemplates: [].concat(homeDeviceChannels).concat(commercialDeviceChannels).concat(jacketDeviceChannels).concat(solarPanelDeviceChannels),
  devices: _.flattenDeep(_.map(rawDevices, (rawDevice) => {
    return _.map(rawDevice.organizations, (organization, orgIdx) => {
      return _.times(rawDevice.count, (idx) => rawDevice.generate({ idx, organization, orgIdx }))
    })
  })),
  endUsers: [].concat(homeUsers).concat(commercialUsers),
  rawDevices
}

module.exports = config
