const expect = require('chai').expect
const commonModule = require('./')

describe('Blueprint service', () => {
  beforeEach(angular.mock.module(commonModule))

  // mock config
  beforeEach(angular.mock.module(($provide) => {
    $provide.constant('CONFIG', {
      account: {
        accountId: 1,
        blueprintHost: 'blueprint.com'
      }
    })
  }))

  let blueprintService
  let $httpBackend
  let $q
  beforeEach(inject(function ($injector) {
    blueprintService = $injector.get('blueprintService')
    $httpBackend = $injector.get('$httpBackend')
    $q = $injector.get('$q')
    const authService = $injector.get('authService')
    // mock token getter
    this.sandbox.stub(authService, 'getToken').returns($q.resolve('token'))

    $httpBackend.whenGET('https://blueprint.com/api/v1/abc?accountId=1')
      .respond({ data: 'data' })
  }))

  afterEach(() => {
    $httpBackend.verifyNoOutstandingExpectation()
    $httpBackend.verifyNoOutstandingRequest()
  })

  describe('#getV1', () => {
    it('should request the resource with authorization', (done) => {
      $httpBackend.expectGET('https://blueprint.com/api/v1/abc?accountId=1', {
        Accept: 'application/json',
        Authorization: 'Bearer token'
      })
      blueprintService.getV1('abc')
        .then((response) => {
          expect(response.data).to.eql({ data: 'data' })
          done()
        })
        .catch(done)
      $httpBackend.flush()
    })
  })
})
