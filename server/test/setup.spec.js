'use strict'

const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')

before(() => {
  chai.use(sinonChai)

  sinon.stub.returnsWithResolve = function returnsWithResolve (data) {
    return this.returns(Promise.resolve(data))
  }

  sinon.stub.returnsWithReject = function returnsWithReject (error) {
    return this.returns(Promise.reject(error))
  }
})

beforeEach(function beforeEach () {
  this.sandbox = sinon.sandbox.create()
})

afterEach(function afterEach () {
  this.sandbox.restore()
})
