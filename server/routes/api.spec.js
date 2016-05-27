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

  describe('PUT /device-config', () => {
    it('should update device config', function * () {
      const config = { foo: 'bar' }
      const updateDeviceConfigStub = this.sandbox.stub(database, 'updateDeviceConfig').returnsWithResolve(['data'])

      const resp = yield request(server.listen())
        .put('/api/device-config')
        .qs({ templateName: 'templateName' })
        .body(config)
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(updateDeviceConfigStub).to.be.calledWith('templateName', config)
    })
  })

  describe('GET /device-config/original', () => {
    it('should return with the original device config', function * () {
      const resp = yield request(server.listen())
        .get('/api/device-config/original')
        .qs({ templateName: 'Solar Panel' })
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql(deviceConfig['Solar Panel'])
    })

    it('should return with an empty object', function * () {
      const resp = yield request(server.listen())
        .get('/api/device-config/original')
        .qs({ templateName: 'Foo' })
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql({})
    })
  })

  describe('GET /images/:id', () => {
    it('should return with an image', function * () {
      const selectImageStub = this.sandbox.stub(database, 'selectImage').returnsWithResolve([{ image: 'image' }])

      const resp = yield request(server.listen())
        .get('/api/images/1')
        .json(true)
        .expect(200)
        .expect('Content-Type', 'image/*; charset=utf-8')
        .end()

      expect(resp.body).to.eql('image')
      expect(selectImageStub).to.be.calledWith('1')
    })
  })
})
