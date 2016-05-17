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

    $provide.constant('DEVICES_CONFIG', {
      general: {
        hiddenChannels: []
      }
    })
  }))

  let devicesService
  let mqttService
  let blueprintService
  let $q
  let $rootScope
  beforeEach(inject(function ($injector) {
    devicesService = $injector.get('devicesService')
    mqttService = $injector.get('mqttService')
    blueprintService = $injector.get('blueprintService')
    $q = $injector.get('$q')
    $rootScope = $injector.get('$rootScope')
  }))

  const device = {
    id: 'device-id',
    channels: [{ channel: 'channel-url' }],
    data: 'data'
  }

  afterEach(() => {
    devicesService.deleteDevice(device)
  })

  describe('#addDevice', () => {
    it('should add the device to the devices object', () => {
      expect(devicesService.devices).to.eql({})

      devicesService.addDevice(device)

      expect(devicesService.devices).to.eql({
        [device.id]: device
      })
    })
  })

  describe('#subscribeDevice', () => {
    it('should subscribe for MQTT updates', function () {
      this.sandbox.spy(mqttService, 'subscribe')

      devicesService.subscribeDevice(device)

      // it should subscribe for update
      expect(mqttService.subscribe).to.have.been.calledOnce
      // first argument
      expect(mqttService.subscribe.args[0][0]).to.eql(device.channels[0].channel)
    })
  })

  describe('#getDevice', () => {
    it('should request the device from blueprint', function () {
      this.sandbox.stub(blueprintService, 'getV1').returns($q.resolve({
        data: { device }
      }))

      this.sandbox.spy(devicesService, 'addDevice')

      devicesService.getDevice('device-id')

      // call promise handlers
      $rootScope.$digest()

      // TODO sinon-chai has some problems
      // expect(blueprintService.getV1).to.have.been.calledWith('devices/device-id')
      blueprintService.getV1.should.have.been.calledWith('devices/device-id')

      // TODO sinon-chai has some problems
      // expect(devicesService.addDevice).to.have.been.calledWith(device)
      devicesService.addDevice.should.have.been.calledWith(device)
    })
  })

  describe('#getDevices', () => {
    it('should request the devices from blueprint', function () {
      this.sandbox.stub(blueprintService, 'getV1').returns($q.resolve({
        data: {
          devices: {
            results: [device]
          }
        }
      }))

      this.sandbox.spy(devicesService, 'addDevice')

      devicesService.getDevices()

      // call promise handlers
      $rootScope.$digest()

      // TODO sinon-chai has some problems
      // expect(blueprintService.getV1).to.have.been.calledWith('devices')
      blueprintService.getV1.should.have.been.calledWith('devices')

      // TODO sinon-chai has some problems
      // expect(devicesService.addDevice).to.have.been.calledWith(device)
      devicesService.addDevice.should.have.been.calledWith(device)
    })
  })
})
