'use strict'

const request = require('super-request')
const expect = require('chai').expect
const server = require('../app')
const database = require('../database')

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

  describe.skip('GET /rules', () => {
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

  describe.skip('GET /rules/:id', () => {
    it('should get rules', function * () {
      this.sandbox.stub(database, 'selectRule')
        .withArgs('id')
        .returnsWithResolve(['data'])

      const resp = yield request(server.listen())
        .get('/api/rules/id')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
    })

    it('should response with 404 if there is no such rule', function * () {
      this.sandbox.stub(database, 'selectRule').returnsWithResolve([])

      yield request(server.listen())
        .get('/api/rules/id')
        .json(true)
        .expect(404)
        .end()
    })
  })

  describe.skip('POST /rules', () => {
    it('should create a new rule', function * () {
      const observer = server.get('observer')
      const ruleConfig = { a: 1 }

      this.sandbox.stub(database, 'insertRule')
        .withArgs(ruleConfig)
        .returnsWithResolve(['data'])
      this.sandbox.stub(observer, 'resetRules')

      const resp = yield request(server.listen())
        .post('/api/rules')
        .body(ruleConfig)
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('data')
      expect(observer.resetRules).to.have.been.called // eslint-disable-line
    })
  })

  describe.skip('DELETE /rules/:id', () => {
    it('should remove a rule', function * () {
      const observer = server.get('observer')

      this.sandbox.stub(database, 'deleteRule')
        .withArgs('id')
        .returnsWithResolve(['data'])
      this.sandbox.stub(observer, 'resetRules')

      yield request(server.listen())
        .del('/api/rules/id')
        .json(true)
        .expect(204)
        .end()

      expect(observer.resetRules).to.have.been.called // eslint-disable-line
    })

    it('should response with 404 if there is no such rule', function * () {
      const observer = server.get('observer')

      this.sandbox.stub(database, 'deleteRule')
        .withArgs('id')
        .returnsWithResolve([])
      this.sandbox.stub(observer, 'resetRules')

      yield request(server.listen())
        .del('/api/rules/id')
        .json(true)
        .expect(404)
        .end()

      expect(observer.resetRules).not.to.have.been.called // eslint-disable-line
    })
  })

  describe.skip('PUT /rules/:id', () => {
    it('should update a rule', function * () {
      const observer = server.get('observer')
      const ruleConfig = { a: 1 }

      this.sandbox.stub(database, 'updateRule')
        .withArgs('id', ruleConfig)
        .returnsWithResolve(['data'])
      this.sandbox.stub(observer, 'resetRules')

      yield request(server.listen())
        .put('/api/rules/id')
        .body({
          ruleConfig
        })
        .json(true)
        .expect(200)
        .end()

      expect(observer.resetRules).to.have.been.called // eslint-disable-line
    })

    it('should response with 404 if there is no such rule', function * () {
      const observer = server.get('observer')

      this.sandbox.stub(database, 'updateRule').returnsWithResolve([])
      this.sandbox.stub(observer, 'resetRules')

      yield request(server.listen())
        .put('/api/rules/id')
        .json(true)
        .expect(404)
        .end()

      expect(observer.resetRules).not.to.have.been.called // eslint-disable-line
    })
  })
})
