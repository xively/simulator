'use strict';

const moment = require('moment');
const extend = require('lodash/object/extend');
const expect = require('chai').expect;
const database = require('./database');

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
  };
  const inventoryMock = {
    serial: 'serial1234567',
    soldDate: moment.utc().toDate(),
    soldTo: 'user',
    sold: false,
    reserved: false
  };
  const ruleMock = {
    ruleConfig: {
      config: 'config'
    }
  };
  const firmwareMock = {
    serialNumber: 'serial1234567',
    deviceId: 'deviceId',
    associationCode: 'associationCode',
    organizationId: 'organizationId',
    accountId: 'accountId',
    entityId: 'entityId',
    entityType: 'entityType',
    secret: 'secret'
  };

  afterEach(function * () {
    yield database.truncateTables();
  });

  describe('application_config', () => {
    it('should insert new app config into the DB', function *() {
      const config = yield database.insertApplicationConfig(appConfigMock);

      delete config[0].id;
      expect(config[0]).to.eql(appConfigMock);
    });

    it('should find app config by accountId', function *() {
      const appConfigData = yield database.insertApplicationConfig(appConfigMock);
      const config = yield database.selectApplicationConfig(appConfigMock.accountId);

      expect(config.length).to.eql(1);
      expect(config).to.eql(appConfigData);
    });
  });

  describe('inventory', () => {
    it('should insert new inventory into the DB', function * () {
      const inventory = yield database.insertInventory(inventoryMock);

      delete inventory[0].id;
      expect(inventory[0]).to.eql(inventoryMock);
    });

    it('should update inventory by id when sell is passed', function * () {
      const inventoryData = yield database.insertInventory(inventoryMock);
      const inventory = yield database.updateInventory('sell', inventoryData[0].id);

      expect(inventory.length).to.eql(1);
      expect(inventory[0].sold).to.eql(true);
    });

    it('should update inventory by id  when reserve is passed', function * () {
      const inventoryData = yield database.insertInventory(inventoryMock);
      const inventory = yield database.updateInventory('reserve', inventoryData[0].id);

      expect(inventory.length).to.eql(1);
      expect(inventory[0].reserved).to.eql(true);
    });

    it('should throw an error when invalid verb is passed', function * () {
      const inventoryData = yield database.insertInventory(inventoryMock);
      try {
        yield database.updateInventory('invaliddate', inventoryData[0].id);
      } catch (ex) {
        return expect(ex.message).to.be.eql('Tried to invaliddate the inventory');
      }

      throw new Error('Should not get here');
    });
  });

  describe('rules', () => {
    it('should insert new rule into the DB', function * () {
      const rule = yield database.insertRule(ruleMock);

      delete rule[0].id;
      expect(rule[0]).to.eql(ruleMock);
    });

    it('should find all rules in the DB', function * () {
      yield database.insertRule(ruleMock);
      yield database.insertRule(ruleMock);
      yield database.insertRule(ruleMock);

      const rules = yield database.selectRules();

      expect(rules.length).to.eql(3);
    });

    it('should find rule by ID', function * () {
      const ruleData = yield database.insertRule(ruleMock);
      const rule = yield database.selectRule(ruleData[0].id);

      expect(rule).to.eql(ruleData);
    });

    it('should update rule by ID', function * () {
      const ruleData = yield database.insertRule(ruleMock);
      const ruleConfig = {
        config: 'updated config'
      };
      const rule = yield database.updateRule(ruleData[0].id, ruleConfig);

      expect(rule[0].ruleConfig).to.eql(ruleConfig);
    });

    it('should remove rule by ID', function * () {
      const ruleData = yield database.insertRule(ruleMock);
      yield database.deleteRule(ruleData[0].id);

      const rules = yield database.selectRules();

      expect(rules.length).to.eql(0);
    });
  });

  describe('firmware', () => {
    it('should insert new firmware into DB', function *() {
      const inventoryData = yield database.insertInventory(inventoryMock);
      const firmware = yield database.insertFirmware(extend({}, firmwareMock, {
        id: inventoryData[0].id
      }));

      delete firmware[0].id;
      expect(firmware[0]).to.eql(firmwareMock);
    });

    it('should find all firmwares in the DB', function *() {
      const inventoryData1 = yield database.insertInventory(inventoryMock);
      const inventoryData2 = yield database.insertInventory(inventoryMock);

      yield database.insertFirmware(extend({}, firmwareMock, {
        id: inventoryData1[0].id
      }));
      yield database.insertFirmware(extend({}, firmwareMock, {
        id: inventoryData2[0].id
      }));

      const firmwares = yield database.selectFirmwares();

      expect(firmwares.length).to.eql(2);
    });

    it('should find firmware by Id', function *() {
      const inventoryData = yield database.insertInventory(inventoryMock);
      const firmwareData = yield database.insertFirmware(extend({}, firmwareMock, {
        id: inventoryData[0].id
      }));
      const firmware = yield database.selectFirmware(firmwareData[0].deviceId);

      expect(firmware).to.eql(firmwareData);
    });
  });
});
