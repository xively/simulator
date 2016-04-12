'use strict'

const request = require('super-request')
const expect = require('chai').expect
const server = require('../app')

describe('Healt check endpoint', () => {
  describe('GET /isalive', () => {
    it('should return a firmware', function * () {
      const resp = yield request(server.listen())
        .get('/isalive')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('YESOK')
    })
  })
})
