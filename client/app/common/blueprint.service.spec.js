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

    $httpBackend.whenGET('https://blueprint.com/api/v1/devices/123?accountId=1')
      .respond({
        device: {
          updatedField: '1.0.0',
          unchangedField: '1.2.3',
          version: 'ABC'
        }
      })

    $httpBackend.whenPUT('https://blueprint.com/api/v1/devices/123')
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

  describe('#updateDevice', () => {
    it('should update device data', (done) => {
      $httpBackend.expectGET('https://blueprint.com/api/v1/devices/123?accountId=1', {
        Accept: 'application/json',
        Authorization: 'Bearer token'
      })

      $httpBackend.expectPUT('https://blueprint.com/api/v1/devices/123', {
        updatedField: 'updated'
      }, {
        Accept: 'application/json',
        Authorization: 'Bearer token',
        Etag: 'ABC',
        'Content-Type': 'application/json;charset=utf-8'
      })

      blueprintService.updateDevice(123, {
        updatedField: 'updated'
      })
        .then((response) => {
          expect(response.data).to.eql({ data: 'data' })
          done()
        })
        .catch(done)
      $httpBackend.flush()
    })
  })
})
