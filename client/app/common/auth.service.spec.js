const expect = require('chai').expect
const commonModule = require('./')

describe('Authentication service', () => {
  beforeEach(angular.mock.module(commonModule))

  // mock config
  const config = {
    account: {
      idmHost: 'idm.host',
      emailAddress: 'email@email.com',
      password: 'pass',
      accountId: 1
    }
  }
  beforeEach(angular.mock.module(($provide) => {
    $provide.constant('CONFIG', {
      account: {
        idmHost: 'idm.host',
        emailAddress: 'email@email.com',
        password: 'pass',
        accountId: 1
      }
    })
  }))

  let authService
  let $httpBackend
  beforeEach(inject(function ($injector) {
    authService = $injector.get('authService')
    $httpBackend = $injector.get('$httpBackend')

    $httpBackend.whenPOST('https://idm.host/api/v1/auth/login-user')
      .respond({ jwt: 'token' })
  }))

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('#newToken', () => {
    it('should request a new token', (done) => {
      $httpBackend.expectPOST('https://idm.host/api/v1/auth/login-user', {
        emailAddress: config.account.emailAddress,
        password: config.account.password,
        accountId: config.account.accountId
      })

      authService.newToken()
        .then((token) => {
          expect(token).to.eql('token')
          done()
        })
        .catch(done)

      $httpBackend.flush()
    })
  })
})
