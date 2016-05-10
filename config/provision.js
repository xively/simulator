'use strict'

const _ = require('lodash')
const uuid = require('uuid')
const faker = require('faker')

const NAMES = {
  CAST_MEMBER_BADGE: 'Cast Member Badge',
  PARK_ORG_TEMPLATE: 'Park',
  CAST_MEMBER: 'Cast Member'
}

const DEVICES_PER_ORGANIZATION = {
  CAST_MEMBER_BADGE: 3
}

/*
 * organizations
 */

const parkOrganizations = [{
  organizationTemplate: NAMES.PARK_ORG_TEMPLATE,
  name: 'Kingdom'
}]

/*
 * device fields
 */
const badgeDeviceFields = _.map({
  employeeId: 'string',
  vendorType: 'string'
}, (fieldType, name) => ({
  name,
  fieldType,
  deviceTemplate: NAMES.CAST_MEMBER_BADGE
}))

/*
 * device channels
 */

const badgeDeviceChannels = _.map({
  checkin: 'timeSeries',
  replenishment_request: 'timeSeries',
  emergency: 'timeSeries'
}, (persistenceType, name) => ({
  name,
  persistenceType,
  entityType: 'deviceTemplate',
  deviceTemplate: NAMES.CAST_MEMBER_BADGE
}))

/*
 * devices
 */
function generateGenericDevice (options) {
  options = options || {}
  const templateName = options.templateName
  const idx = options.idx
  const orgIdx = options.orgIdx
  const organization = options.organization || {}
  const namePostfix = _.isNumber(idx) ? idx + 1 : ''
  const name = options.name || `${(NAMES[templateName] || '').replace(/\s/g, '-')}-${namePostfix}`
  const serialNumberPostfix = _.isNumber(orgIdx) && _.isNumber(idx) ? _.padStart(DEVICES_PER_ORGANIZATION[templateName] * orgIdx + idx + 1, 6, '0') : ''
  const serialNumber = options.serialNumber || `${(NAMES[templateName] || '').replace(/\s/g, '-')}-${serialNumberPostfix}`
  const deviceTemplateId = options.deviceTemplateId

  return {
    name,
    serialNumber,
    deviceTemplateId,
    deviceTemplate: NAMES[templateName],
    organization: organization.name,
    organizationId: organization.id,
    productionRun: 'DEC2016',
    hardwareVersion: faker.system.semver(),
    firmwareVersion: faker.system.semver(),
    longitude: -81.581861,
    latitude: 28.418201
  }
}

const rawDevices = [{
  name: NAMES.CAST_MEMBER_BADGE,
  count: DEVICES_PER_ORGANIZATION.CAST_MEMBER_BADGE,
  organizations: parkOrganizations,
  generate: (options) => {
    const generic = generateGenericDevice(Object.assign({ templateName: 'CAST_MEMBER_BADGE' }, options || {}))
    return _.merge(generic, {
      employeeId: uuid.v4(),
      vendorType: 'popcorn'
    })
  }
}]

/*
 * users
 */

const castMember = _.reduce(parkOrganizations, (users, organization) => {
  return _.times(2, (idx) => ({
    organizationTemplate: organization.organizationTemplate,
    organization: organization.name,
    endUserTemplate: NAMES.CAST_MEMBER,
    email: faker.internet.email()
  })).concat(users)
}, [])

const config = {
  organizationTemplates: [{
    name: NAMES.PARK_ORG_TEMPLATE
  }],
  deviceTemplates: [{
    name: NAMES.CAST_MEMBER_BADGE
  }],
  endUserTemplates: [{
    name: NAMES.CAST_MEMBER
  }],
  organizations: [].concat(parkOrganizations),
  deviceFields: [].concat(badgeDeviceFields),
  channelTemplates: [].concat(badgeDeviceChannels),
  devices: _.flattenDeep(_.map(rawDevices, (rawDevice) => {
    return _.map(rawDevice.organizations, (organization, orgIdx) => {
      return _.times(rawDevice.count, (idx) => rawDevice.generate({ idx, organization, orgIdx }))
    })
  })),
  endUsers: [].concat(castMember),
  rawDevices
}

module.exports = config
