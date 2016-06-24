'use strict'

const request = require('super-request')
const expect = require('chai').expect
const server = require('../app')

describe('Nest PIN endpoint', () => {
  describe('GET /nestpin', () => {
    it('should return an access token', function * () {
      const resp = yield request(server.listen())
        .get('/nestpin')
        .json(true)
        .expect(200)
        .end()

      expect(resp.body).to.eql('YESOKEJ')
    })
  })
})
