'use strict'

const expect = require('chai').expect
const database = require('./database')

describe('Database', () => {
  const appConfigMock = {
    accountId: 'accountId',
    organization: {
      name: 'organization'
    },
    mqttUser: {
      name: 'mqttUser'
    },
    device: {
      name: 'device'
    },
    endUser: {
      name: 'endUser'
    }
  }
  const deviceConfigMock = {
    templateName: 'templateName',
    config: {
      foo: 'bar'
    }
  }
  const ruleMock = {
    config: 'config'
  }
  const firmwareMock = {
    serialNumber: 'serialNumber',
    deviceId: 'deviceId',
    associationCode: 'associationCode',
    organizationId: 'organizationId',
    accountId: 'accountId',
    entityId: 'entityId',
    entityType: 'entityType',
    secret: 'secret',
    template: {
      name: 'templateName'
    },
    name: 'name'
  }

  afterEach(function * () {
    yield database.truncateTables()
  })

  describe('application_config', () => {
    it('should insert new app config into the DB', function * () {
      const config = yield database.insertApplicationConfig(appConfigMock)

      delete config[0].id
      expect(config[0]).to.eql(appConfigMock)
    })

    it('should find app config by accountId', function * () {
      const appConfigData = yield database.insertApplicationConfig(appConfigMock)
      const config = yield database.selectApplicationConfig(appConfigMock.accountId)

      expect(config.length).to.eql(1)
      expect(config).to.eql(appConfigData)
    })
  })

  describe('device_config', () => {
    it('should create a device config', function * () {
      const config = yield database.createDeviceConfig(deviceConfigMock)

      expect(config[0]).to.eql(deviceConfigMock)
    })

    it('should select all device configs', function * () {
      yield database.createDeviceConfig(deviceConfigMock)
      yield database.createDeviceConfig(deviceConfigMock)
      const config = yield database.selectDeviceConfigs(deviceConfigMock)

      expect(config).to.eql([deviceConfigMock, deviceConfigMock])
    })

    it('should select a device config by template name', function * () {
      yield database.createDeviceConfig(deviceConfigMock)
      const config = yield database.selectDeviceConfig(deviceConfigMock.templateName)

      expect(config).to.eql([deviceConfigMock])
    })

    it('should update a device config by template name', function * () {
      yield database.createDeviceConfig(deviceConfigMock)
      const config = yield database.updateDeviceConfig(deviceConfigMock.templateName, {
        foo: 'bar2'
      })

      expect(config).to.eql([{
        templateName: deviceConfigMock.templateName,
        config: {
          foo: 'bar2'
        }
      }])
    })

    it('should create a new device config if it\'s not yet in the db', function * () {
      const config = yield database.updateDeviceConfig(deviceConfigMock.templateName, deviceConfigMock.config)

      expect(config).to.eql([deviceConfigMock])
    })
  })

  describe('rules', () => {
    it('should insert new rule into the DB', function * () {
      const rule = yield database.insertRule(ruleMock)

      delete rule[0].id
      expect(rule[0]).to.eql({
        ruleConfig: ruleMock
      })
    })

    it('should find all rules in the DB', function * () {
      yield database.insertRule(ruleMock)
      yield database.insertRule(ruleMock)
      yield database.insertRule(ruleMock)

      const rules = yield database.selectRules()

      expect(rules.length).to.eql(3)
    })

    it('should find rule by ID', function * () {
      const ruleData = yield database.insertRule(ruleMock)
      const rule = yield database.selectRule(ruleData[0].id)

      expect(rule).to.eql(ruleData)
    })

    it('should update rule by ID', function * () {
      const ruleData = yield database.insertRule(ruleMock)
      const ruleConfig = {
        config: 'updated config'
      }
      const rule = yield database.updateRule(ruleData[0].id, ruleConfig)

      expect(rule[0].ruleConfig).to.eql(ruleConfig)
    })

    it('should remove rule by ID', function * () {
      const ruleData = yield database.insertRule(ruleMock)
      yield database.deleteRule(ruleData[0].id)

      const rules = yield database.selectRules()

      expect(rules.length).to.eql(0)
    })
  })

  describe('firmware', () => {
    it('should insert new firmware into DB', function * () {
      const firmware = yield database.insertFirmware(firmwareMock)

      delete firmware[0].id
      expect(firmware[0]).to.eql(firmwareMock)
    })

    it('should find all firmwares in the DB', function * () {
      yield database.insertFirmware(firmwareMock)
      yield database.insertFirmware(firmwareMock)

      const firmwares = yield database.selectFirmwares()

      expect(firmwares.length).to.eql(2)
    })

    it('should find firmware by Id', function * () {
      const firmwareData = yield database.insertFirmware(firmwareMock)
      const firmware = yield database.selectFirmware(firmwareData[0].deviceId)

      expect(firmware).to.eql(firmwareData)
    })
  })
})
