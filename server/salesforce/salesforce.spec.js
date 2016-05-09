'use strict'

const expect = require('chai').expect
const jsforce = require('jsforce')
const salesforce = require('./salesforce')
const config = require('../../config/server')

describe.skip('Salesforce', () => {
  beforeEach(function () {
    config.salesforce = {
      user: 'user',
      pass: 'pass',
      token: 'token'
    }

    function Connection () {}
    Connection.prototype.login = this.sandbox.spy(() => Promise.resolve())
    Connection.prototype.sobject = this.sandbox.spy(function () {
      return this
    })
    Connection.prototype.upsertBulk = this.sandbox.spy(() => Promise.resolve([]))
    Connection.prototype.insert = this.sandbox.spy(() => Promise.resolve([]))
    Connection.prototype.upsert = this.sandbox.spy(() => Promise.resolve([]))
    Connection.prototype.retrieve = this.sandbox.spy(() => Promise.resolve())

    this.sandbox.stub(jsforce, 'Connection', Connection)
  })

  it('should add assets', function (done) {
    const assets = [{
      product: 'product',
      serial: 'serial',
      deviceId: 'deviceId',
      orgId: 'orgId'
    }]

    const transformedAssets = [{
      Name: 'product',
      SerialNumber: 'serial',
      [config.salesforce.deviceField]: 'deviceId',
      Contact: { xively__XI_End_User_ID__c: 'orgId' }
    }]

    salesforce.addAssets(assets)
      .then(() => {
        expect(salesforce.connection.sobject).to.be.calledWith('Asset')
        expect(salesforce.connection.upsertBulk).to.be.calledWith(transformedAssets, config.salesforce.deviceField)
        done(null)
      })
      .catch(done)
  })

  it('should add cases', function (done) {
    const cases = [{
      subject: 'subject',
      description: 'description',
      deviceId: 'deviceId',
      orgId: 'orgId'
    }]

    const transformedCases = [{
      Subject: 'subject',
      Description: 'description',
      Contact: { xively__XI_End_User_ID__c: 'orgId' },
      Asset: { [config.salesforce.deviceField]: 'deviceId' },
      [config.salesforce.deviceField]: 'deviceId'
    }]

    salesforce.addCases(cases)
      .then(() => {
        expect(salesforce.connection.sobject).to.be.calledWith('Case')
        expect(salesforce.connection.insert).to.be.calledWith(transformedCases)
        done(null)
      })
      .catch(done)
  })

  it('should add contacts', function (done) {
    const contacts = [{
      email: 'email',
      orgId: 'orgId'
    }]

    const transformedContacts = [{
      Email: 'email',
      xively__XI_End_User_ID__c: 'orgId'
    }]

    salesforce.addContacts(contacts)
      .then(() => {
        expect(salesforce.connection.sobject).to.be.calledWith('Contact')
        expect(salesforce.connection.upsert).to.be.calledWith(transformedContacts, 'xively__XI_End_User_ID__c')
        done(null)
      })
      .catch(done)
  })

  it('should retrieve a contact', function (done) {
    const contactId = 'contactId'
    salesforce.retrieveContact(contactId)
      .then(() => {
        expect(salesforce.connection.sobject).to.be.calledWith('Contact')
        expect(salesforce.connection.retrieve).to.be.calledWith(contactId)
        done(null)
      })
      .catch(done)
  })
})
