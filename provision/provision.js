'use strict'

const path = require('path')
const _ = require('lodash')
const logger = require('winston')
const blueprint = require('../server/xively').blueprint
const database = require('../server/database')
const config = require('../config/provision')
const deviceConfig = require('../config/devices')

logger.info('Creating: organization templates, device templates, end user templates')
Promise.all([
  blueprint.createOrganizationTemplates(config.organizationTemplates),
  blueprint.createDeviceTemplates(config.deviceTemplates),
  blueprint.createEndUserTemplates(config.endUserTemplates)
])
.then((arr) => ({
  organizationTemplates: arr[0],
  deviceTemplates: arr[1],
  endUserTemplates: arr[2]
}))
.then((data) => {
  const organizationTemplates = data.organizationTemplates
  const deviceTemplates = data.deviceTemplates

  config.organizations = config.organizations.map((organization) => Object.assign(organization, {
    organizationTemplateId: _.find(organizationTemplates, { name: organization.organizationTemplate }).id
  }))

  config.channelTemplates = config.channelTemplates.map((channelTemplate) => Object.assign(channelTemplate, {
    entityId: _.find(deviceTemplates, { name: channelTemplate.deviceTemplate }).id
  }))

  config.deviceFields = config.deviceFields.map((deviceFields) => Object.assign(deviceFields, {
    deviceTemplateId: _.find(deviceTemplates, { name: deviceFields.deviceTemplate }).id
  }))

  logger.info('Creating: organizations, channel templates, device fields')
  return Promise.all([
    blueprint.createOrganizations(config.organizations),
    blueprint.createChannelTemplates(config.channelTemplates),
    blueprint.createDeviceFields(config.deviceFields)
  ])
  .then((arr) => Object.assign({
    organizations: arr[0],
    channelTemplates: arr[1],
    deviceFields: arr[2]
  }, data))
})
.then((data) => {
  const organizations = data.organizations
  const organizationTemplates = data.organizationTemplates
  const endUserTemplates = data.endUserTemplates
  const deviceTemplates = data.deviceTemplates

  config.endUsers = config.endUsers.map((endUser) => Object.assign(endUser, {
    organizationId: _.find(organizations, { name: endUser.organization }).id,
    organizationTemplateId: _.find(organizationTemplates, { name: endUser.organizationTemplate }).id,
    endUserTemplateId: _.find(endUserTemplates, { name: endUser.endUserTemplate }).id
  }))

  config.devices = config.devices.map((device) => Object.assign(device, {
    deviceTemplateId: _.find(deviceTemplates, { name: device.deviceTemplate }).id,
    organizationId: _.find(organizations, { name: device.organization }).id
  }))

  logger.info('Creating: end users, devices')
  return Promise.all([
    blueprint.createEndUser(config.endUsers),
    blueprint.createDevices(config.devices)
  ])
  .then((arr) => Object.assign({
    endUsers: arr[0],
    devices: arr[1]
  }, data))
})
.then((data) => {
  const endUsers = data.endUsers.map((endUser) => ({
    entityId: endUser.id,
    entityType: 'endUser'
  }))

  logger.info('Creating: end users MQTT credentials')
  return blueprint.createMqttCredentials(endUsers)
    .then((mqttCredentials) => Object.assign({ mqttCredentials }, data))
})
.then((data) => {
  const tableScript = path.join(__dirname, 'tables.sql')

  return database.runScriptFile(tableScript)
    .then(() => {
      let configs = data.deviceTemplates.map((template) => {
        return database.createDeviceConfig({
          templateName: template.name,
          config: deviceConfig[template.name]
        })
      })
      configs.push(database.createDeviceConfig({
        templateName: 'general',
        config: deviceConfig.general
      }))

      return Promise.all(configs)
    })
})
.then(() => {
  console.log('Provision done')
  process.exit()
})
.catch((err) => {
  console.error('Provision error', err, err.obj && err.obj.error.details)
  process.exit(1)
})
