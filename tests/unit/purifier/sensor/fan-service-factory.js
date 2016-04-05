'use strict';

var ngModule = angular.mock.module;

describe('purifierFanService', function() {
  var purifierFanService, sensorStore, mqttSensorPublisher, rootscopeOn, rootScope;
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

      $provide.factory('sensorStore', function() {
        return {
          set: sinon.stub().returns(true),
        };
      });
    });
  });

  beforeEach(inject(function(_purifierFanService_, _sensorStore_, _mqttSensorPublisher_, _$rootScope_) {
    rootScope = _$rootScope_;
    rootscopeOn = sinon.spy(rootScope, '$on');

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
      purifierFanService.init('cheerios');
    });

    // This is a little bit implementation-specific, I know. Forgive me.
    it('should register a callback in our handlers', function() {
      // expect(handlers).to.have.length(1);
      expect(rootscopeOn.callCount).to.equal(1);
      var args = rootscopeOn.getCall(0).args;
      expect(args[0]).to.equal('speed');
    });

    describe('when that event is not for speed', function() {
      it('should not call sensorStore.set', function() {
        var message = {
          command: 'somethingElse',
        };
        rootScope.$broadcast(message.command, message);

        expect(sensorStore.set.callCount).to.equal(0);
      });
    });

    describe('when that event is for speed', function() {
      beforeEach(function() {
        var message = {
          command: 'speed',
          option: 'THREE',
        };
        rootScope.$broadcast(message.command, message);
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
  });
});
