'use strict'

require('dotenv').config()

const path = require('path')
const bp = require('./blueprint')
const database = require('../server/database')
const config = require('../config/provision')

bp.useDemoAccount()
bp.getJwt()
  .then(bp.getClient)
  .then(bp.createOrganizationTemplate((body) => {
    Object.assign(body, config.organizationTemplate)
  }))
  .then(bp.createOrganization((body, data) => {
    Object.assign(body, config.organization, {
      organizationTemplateId: data.organizationTemplate.id
    })
  }))
  .then(bp.createDeviceTemplate((body, data) => {
    Object.assign(body, config.deviceTemplate)
  }))
  .then(bp.createDeviceFields(
    config.deviceFields.map((field) => {
      return (body, data) => {
        Object.assign(body, field, {
          deviceTemplateId: data.deviceTemplate.id
        })
      }
    })
  ))
  .then(bp.createChannelTemplates(
    config.channelTemplates.map((channel) => {
      return (body, data) => {
        Object.assign(body, channel, {
          entityId: data.deviceTemplate.id
        })
      }
    })
  ))
  .then(bp.createDevices(
    config.devices.map((device) => {
      return (body, data) => {
        Object.assign(body, device, {
          deviceTemplateId: data.deviceTemplate.id,
          organizationId: data.organization.id
        })
      }
    })
  ))
  .then(bp.createEndUserTemplate((body, data) => {
    Object.assign(body, config.userTemplate)
  }))
  .then(bp.createEndUser((body, data) => {
    Object.assign(body, {
      organizationTemplateId: data.organizationTemplate.id,
      organizationId: data.organization.id,
      endUserTemplateId: data.endUserTemplate.id
    })
  }))
  .then((data) => {
    return bp.createMqttCredentials({
      outputProp: 'mqttDevice',
      body: data.device.map((device) => {
        return (body) => {
          Object.assign(body, {
            entityId: device.id,
            entityType: 'device'
          })
        }
      })
    })(data)
  })
  .then(bp.createMqttCredentials({
    outputProp: 'mqttUser',
    body: (body, data) => {
      Object.assign(body, {
        entityId: data.endUser.id,
        entityType: 'endUser'
      })
    }
  }))
  .then((data) => {
    const tableScript = path.join(__dirname, 'tables.sql')

    return database.runScriptFile(tableScript)
      .then(() => {
        return Promise.all(data.device.map((device) => {
          const mqttCredentials = data.mqttDevice.find((d) => d.entityId === device.id)
          const firmware = {
            serialNumber: device.serialNumber,
            deviceId: device.id,
            template: data.deviceTemplate,
            organizationId: device.organizationId,
            accountId: mqttCredentials.accountId,
            entityId: mqttCredentials.entityId,
            entityType: mqttCredentials.entityType,
            secret: mqttCredentials.secret
          }

          return database.insertInventory({ serial: firmware.serial })
            .then((rows) => {
              firmware.id = rows[0].id
              return database.insertFirmware(firmware)
            })
        }))
      })
      .then(() => {
        const appConfig = {
          accountId: process.env.XIVELY_ACCOUNT_ID,
          organization: data.organization,
          mqttUser: data.mqttUser,
          endUser: data.endUser,
          device: data.device[0]
        }
        return database.insertApplicationConfig(appConfig)
      })
  })
  .then(() => {
    console.log('Provision done')
    process.exit()
  })
  .catch((err) => {
    console.error('Provision error', err)
    process.exit(1)
  })
