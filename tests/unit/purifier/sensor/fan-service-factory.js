'use strict';

var ngModule = angular.mock.module;

describe('purifierFanService', function() {
  var handlers, publish, purifierFanService, sensorStore, mqttSensorPublisher;
  beforeEach(function() {
    ngModule('purifier.sensor');

    var fakeSensorProps = {
      fan: {
        initial: 0,
        max: 2,
        min: 0,
        map: ['one', 'two', 'three'],
      },
    };

    ngModule(function($provide) {
      $provide.value('sensorProps', fakeSensorProps);
      $provide.value('mqttConfig', {
        dataChannel: 'sandwich',
      });

      $provide.factory('mqttSensorPublisher', function() {
        return {
          publishUpdate: sinon.stub(),
        };
      });

      // This is a mini mock pubsub implementation
      handlers = [];
      publish = function(message) {
        handlers.forEach(function(handler) {
          handler({
            payloadString: JSON.stringify(message),
          });
        });
      };
      $provide.factory('mqttService', function() {
        return {
          subscribe: function(channel, cb) {
            handlers.push(cb);
          },
        };
      });

      $provide.factory('sensorStore', function() {
        return {
          set: sinon.stub().returns(true),
        };
      });
    });
  });

  beforeEach(inject(function(_purifierFanService_, _sensorStore_, _mqttSensorPublisher_) {
    purifierFanService = _purifierFanService_;
    sensorStore = _sensorStore_;
    mqttSensorPublisher = _mqttSensorPublisher_;
  }));

  it('should be an Object with a `init` method', function() {
    expect(purifierFanService).to.be.an('object');
    expect(purifierFanService).to.have.all.keys(['init', 'startSimulation', 'stopSimulation']);
  });

  describe('calling init, then emitting an event', function() {
    beforeEach(function() {
      purifierFanService.init('honey-nut', 'cheerios');
    });

    // This is a little bit implementation-specific, I know. Forgive me.
    it('should register a callback in our handlers', function() {
      expect(handlers).to.have.length(1);
    });

    describe('when that event is not for speed', function() {
      it('should not call sensorStore.set', function() {
        publish({
          payloadString: {
            command: 'somethingElse',
          },
        });
        expect(sensorStore.set.callCount).to.equal(0);
      });
    });

    describe('when that event is for speed', function() {
      beforeEach(function() {
        publish({
          command: 'speed',
          option: 'THREE',
        });
      });

      it('should call sensorStore.set', function() {
        expect(sensorStore.set.callCount).to.equal(1);
        expect(sensorStore.set.calledWithExactly('fan', 2)).to.be.true;
      });

      it('should call publish an update over MQTT', function() {
        expect(mqttSensorPublisher.publishUpdate.callCount).to.equal(1);
        expect(mqttSensorPublisher.publishUpdate.calledWithExactly(['fan'], 'cheerios')).to.be.true;
      });
    });

    describe('when the payloadString is malformed', function() {
      it('should not error', function() {
        expect(function() {
          publish(2);
        }).to.not.throw();
      });
    });
  });
});
