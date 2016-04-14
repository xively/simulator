'use strict'

const expect = require('chai').expect
const Salesforce = require('./salesforce')
const jsforce = require('jsforce')
const logger = require('winston')

describe.skip('Salesforce', () => {
  it('should throw error if nothing is passed', () => {
    try {
      new Salesforce() // eslint-disable-line
    } catch (ex) {
      expect(ex.message).to.eql('Salesforce options are missing (user, password, token)')
      return
    }

    throw new Error('Should not get here')
  })

  it('should throw error if options doesn\'t have user', () => {
    const options = {
      password: 'password',
      token: 'token'
    }

    try {
      new Salesforce(options) // eslint-disable-line
    } catch (ex) {
      expect(ex.message).to.eql('Salesforce options are missing (user, password, token)')
      return
    }

    throw new Error('Should not get here')
  })

  it('should throw error if options doesn\'t have password', () => {
    const options = {
      user: 'user',
      token: 'token'
    }

    try {
      new Salesforce(options) // eslint-disable-line
    } catch (ex) {
      expect(ex.message).to.eql('Salesforce options are missing (user, password, token)')
      return
    }

    throw new Error('Should not get here')
  })

  it('should throw error if options doesn\'t have token', () => {
    const options = {
      user: 'user',
      password: 'password'
    }

    try {
      new Salesforce(options) // eslint-disable-line
    } catch (ex) {
      expect(ex.message).to.eql('Salesforce options are missing (user, password, token)')
      return
    }

    throw new Error('Should not get here')
  })

  it('should initiate without error', function () {
    const options = {
      user: 'user',
      password: 'password',
      token: 'token'
    }

    const loginSpy = this.sandbox.spy()
    this.sandbox.stub(jsforce, 'Connection').returns({
      login: loginSpy
    })

    new Salesforce(options) // eslint-disable-line
    expect(loginSpy).to.be.calledWith('user', 'passwordtoken')
  })

  it('should initiate without error', function () {
    const options = {
      user: 'user',
      password: 'password',
      token: 'token'
    }

    const loginSpy = this.sandbox.spy()
    this.sandbox.stub(jsforce, 'Connection').returns({
      login: loginSpy
    })

    new Salesforce(options) // eslint-disable-line
    expect(loginSpy).to.be.calledWith('user', 'passwordtoken')
  })

  it.skip('should add assets', function () {
    const options = {
      user: 'user',
      password: 'password',
      token: 'token'
    }
    const assets = [{
      product: 'product',
      serial: 'serial',
      deviceId: 'deviceId',
      orgId: 'orgId'
    }]
    const upsertBulkSpy = this.sandbox.spy(() => Promise.resolve([{
      success: true
    }]))
    const sobjectSpy = this.sandbox.spy(function () {
      return this
    })

    this.sandbox.stub(jsforce, 'Connection').returns({
      login: () => Promise.resolve(),
      sobject: sobjectSpy,
      upsertBulk: upsertBulkSpy
    })

    const loggerSpy = this.sandbox.spy(logger, 'info')

    const salesforce = new Salesforce(options)
    salesforce.addAssets(assets)

    expect(sobjectSpy).to.be.calledWith('Asset')
    expect(loggerSpy).to.be.calledWith('Salesforce #addAssets', 'inserted successfully: serial')
  })
})
