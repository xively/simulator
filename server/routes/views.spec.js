'use strict';

const request = require('super-request');
const expect = require('chai').expect;
const server = require('../server');

describe('View endpoints', () => {
  describe('GET /', () => {
    it('should return an html', function *() {
      const resp = yield request(server.listen())
        .get('/')
        .json(true)
        .expect(200)
        .end();

      expect(resp.body).includes('html');
    });
  });

  describe('GET /virtual-device', () => {
    it('should return an html', function *() {
      const resp = yield request(server.listen())
        .get('/virtual-device')
        .json(true)
        .expect(200)
        .end();

      expect(resp.body).includes('html');
    });
  });

  describe('GET /manage', () => {
    it('should return an html', function *() {
      const resp = yield request(server.listen())
        .get('/manage')
        .json(true)
        .expect(200)
        .end();

      expect(resp.body).includes('html');
    });
  });
});
