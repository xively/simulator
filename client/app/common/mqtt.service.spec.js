const expect = require('chai').expect
const commonModule = require('./')

describe('MQTT service', () => {
  beforeEach(angular.mock.module(commonModule))

  // mock config
  beforeEach(angular.mock.module(($provide) => {
    $provide.constant('CONFIG', { asd: 1 })
  }))

  let mqttService
  let $q
  let $rootScope
  beforeEach(inject(($injector) => {
    mqttService = $injector.get('mqttService')
    $q = $injector.get('$q')
    $rootScope = $injector.get('$rootScope')
  }))

  describe('#parseMessage', () => {
    it('should parse JSON message', () => {
      const obj = { a: 1 }
      const message = mqttService.parseMessage({
        payloadString: JSON.stringify(obj)
      })
      expect(message).to.eql(obj)
    })

    it('should parse CSV message', () => {
      const now = Date.now()
      let message = mqttService.parseMessage({
        payloadString: `${now},name,20`
      })

      expect(message).to.eql({
        name: {
          timestamp: now,
          numericValue: 20,
          name: 'name'
        }
      })

      message = mqttService.parseMessage({
        payloadString: `${now}, name, 20, 20`
      })

      expect(message).to.eql({
        name: {
          timestamp: now,
          numericValue: 20,
          stringValue: '20',
          name: 'name'
        }
      })
    })

    it('should handle plain number', () => {
      const message = mqttService.parseMessage({ payloadString: '20' }, 'xi/channel/sensorName')
      expect(message).to.eql({
        sensorName: {
          numericValue: 20
        }
      })
    })
  })

  describe('#subscribe', () => {
    let listenerFunction
    beforeEach(function () {
      mqttService.connected = $q.resolve()
      mqttService.client = {
        subscribe (channel, listener) {
          listenerFunction = listener
        }
      }
    })

    it('should emit messages to listeners', function () {
      const channel = 'ch'
      const listenerSpy = this.sandbox.spy()
      mqttService.subscribe(channel, listenerSpy)
      $rootScope.$digest()

      const obj = { b: 2 }
      listenerFunction({
        payloadString: JSON.stringify(obj)
      })
      $rootScope.$digest()

      // TODO sinon-chai has some problems
      // expect(listenerSpy).to.have.been.calledWith(obj)
      listenerSpy.should.have.been.calledWith(obj)
    })
  })

  describe('#sendMessage', () => {
    beforeEach(function () {
      mqttService.connected = $q.resolve()
      mqttService.client = {
        send: this.sandbox.spy()
      }
    })

    it('should send the payloadString', function () {
      mqttService.sendMessage('channel', {
        payloadString: 'text'
      })

      $rootScope.$digest()

      // TODO sinon-chai has some problems
      // expect(mqttService.client.send).to.have.been.calledWith('channel', 'text')
      mqttService.client.send.should.have.been.calledWith('channel', 'text')
    })

    it('should format the payload object to CSV', function () {
      const now = Date.now()
      mqttService.sendMessage('channel', {
        payload: {
          timestamp: now,
          name: 'name',
          numericValue: 20,
          stringValue: '20'
        }
      })

      $rootScope.$digest()

      // TODO sinon-chai has some problems
      // expect(mqttService.client.send).to.have.been.calledWith('channel', `${now},name,20,20`)
      mqttService.client.send.should.have.been.calledWith('channel', `${now},name,20,20`)
    })
  })
})
