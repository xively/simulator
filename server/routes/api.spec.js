'use strict'

const request = require('super-request')
const expect = require('chai').expect

const deviceConfig = require('../../config/devices')
const server = require('../app')
const database = require('../database')
const rulesEngine = require('../rules')

describe('API endpoints (/api/*)', () => {
  describe('GET /firmware/:id', () => {
    it('should return a firmware', function * () {
      this.sandbox.stub(database, 'selectFirmware')
        .withArgs('id')
        .returnsWithResolve(['data'])

      const resp = yield request(server.listen())
        .get('/api/firmware/id')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
    })
  })

  describe('PUT /inventory/:verb/:id', () => {
    it('should update an inventory', function * () {
      this.sandbox.stub(database, 'updateInventory')
        .withArgs('verb', 'id')
        .returnsWithResolve(['data'])

      const resp = yield request(server.listen())
        .put('/api/inventory/verb/id')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
    })
  })

  describe('GET /rules', () => {
    it('should get rules', function * () {
      this.sandbox.stub(database, 'selectRules').returnsWithResolve(['data'])

      const resp = yield request(server.listen())
        .get('/api/rules')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql(['data'])
    })
  })

  describe('GET /rules/:id', () => {
    it('should get rules', function * () {
      const selectRuleStub = this.sandbox.stub(database, 'selectRule').returnsWithResolve(['data'])
      const resp = yield request(server.listen())
        .get('/api/rules/ruleId')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(selectRuleStub).to.be.calledWith('ruleId')
    })

    it('should response with 404 if there is no such rule', function * () {
      const selectRuleStub = this.sandbox.stub(database, 'selectRule').returnsWithResolve([])

      yield request(server.listen())
        .get('/api/rules/ruleId')
        .json(true)
        .expect(404)
        .end()

      expect(selectRuleStub).to.be.calledWith('ruleId')
    })
  })

  describe('POST /rules', () => {
    it('should create a new rule', function * () {
      const ruleConfig = { a: 1 }

      const insertRuleStub = this.sandbox.stub(database, 'insertRule').returnsWithResolve(['data'])
      const updateRulesStub = this.sandbox.stub(rulesEngine, 'updateRules')

      const resp = yield request(server.listen())
        .post('/api/rules')
        .body(ruleConfig)
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(insertRuleStub).to.be.calledWith(ruleConfig)
      expect(updateRulesStub).to.be.called // eslint-disable-line
    })
  })

  describe('DELETE /rules/:id', () => {
    it('should remove a rule', function * () {
      const deleteRuleStub = this.sandbox.stub(database, 'deleteRule').returnsWithResolve(['data'])
      const updateRulesStub = this.sandbox.stub(rulesEngine, 'updateRules')

      yield request(server.listen())
        .del('/api/rules/ruleId')
        .json(true)
        .expect(204)
        .end()

      expect(deleteRuleStub).to.be.calledWith('ruleId')
      expect(updateRulesStub).to.be.called // eslint-disable-line
    })

    it('should response with 404 if there is no such rule', function * () {
      const deleteRuleStub = this.sandbox.stub(database, 'deleteRule').returnsWithResolve([])
      const updateRulesStub = this.sandbox.stub(rulesEngine, 'updateRules')

      yield request(server.listen())
        .del('/api/rules/ruleId')
        .json(true)
        .expect(404)
        .end()

      expect(deleteRuleStub).to.be.calledWith('ruleId')
      expect(updateRulesStub).to.not.be.called // eslint-disable-line
    })
  })

  describe('PUT /rules/:id', () => {
    it('should update a rule', function * () {
      const ruleConfig = { a: 1 }

      const updateRuleStub = this.sandbox.stub(database, 'updateRule').returnsWithResolve(['data'])
      const updateRulesStub = this.sandbox.stub(rulesEngine, 'updateRules')

      const resp = yield request(server.listen())
        .put('/api/rules/ruleId')
        .body({
          ruleConfig
        })
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(updateRuleStub).to.be.calledWith('ruleId')
      expect(updateRulesStub).to.be.called // eslint-disable-line
    })

    it('should response with 404 if there is no such rule', function * () {
      const updateRuleStub = this.sandbox.stub(database, 'updateRule').returnsWithResolve([])
      const updateRulesStub = this.sandbox.stub(rulesEngine, 'updateRules')

      yield request(server.listen())
        .put('/api/rules/ruleId')
        .json(true)
        .expect(404)
        .end()

      expect(updateRuleStub).to.be.calledWith('ruleId')
      expect(updateRulesStub).to.not.be.called // eslint-disable-line
    })
  })

  describe('GET /device-config', () => {
    it('should return device config', function * () {
      const selectDeviceConfigStub = this.sandbox.stub(database, 'selectDeviceConfig').returnsWithResolve(['data'])

      yield database.initDeviceConfig()
      const resp = yield request(server.listen())
        .get('/api/device-config')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(selectDeviceConfigStub).to.be.called // eslint-disable-line
    })
  })

  describe('PUT /device-config', () => {
    it('should update device config', function * () {
      const deviceConfig = { a: 1 }
      const updateDeviceConfigStub = this.sandbox.stub(database, 'updateDeviceConfig').returnsWithResolve(['data'])

      yield database.initDeviceConfig()
      const resp = yield request(server.listen())
        .put('/api/device-config')
        .body(deviceConfig)
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(updateDeviceConfigStub).to.be.calledWith(deviceConfig)
    })
  })

  describe('GET /device-config/original', () => {
    it('should return with the original device config', function * () {
      const resp = yield request(server.listen())
        .get('/api/device-config/original')
        .expect(200)
        .end()

      expect(resp.body).to.eql(JSON.stringify(deviceConfig))
    })
  })
})
