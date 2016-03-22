'use strict';

var ngModule = angular.mock.module;

describe('mqttSensorPublisher', function() {
  var completeUpdate, mqttSensorPublisher, mqttService;
  beforeEach(function() {
    ngModule('purifier.sensor');

    var fakeSensorProps = {
      something: {
        initial: 5,
        max: 10,
        min: 0,
      },
      fan: {
        initial: 0,
        max: 2,
        min: 0,
        map: ['one', 'two', 'three'],
      },
    };

    completeUpdate = ',something,5,\n,fan,0,one';

    ngModule(function($provide) {
      $provide.value('sensorProps', fakeSensorProps);

      $provide.factory('mqttService', function() {
        return {
          sendMessage: sinon.stub(),
        };
      });

      $provide.factory('sensorStore', function() {
        return {
          get: function(prop) {
            return fakeSensorProps[prop].initial;
          },
        };
      });
    });
  });

  beforeEach(inject(function(_mqttSensorPublisher_, _mqttService_) {
    mqttSensorPublisher = _mqttSensorPublisher_;
    mqttService = _mqttService_;
  }));

  it('should be an Object with a `publishUpdate` method', function() {
    expect(mqttSensorPublisher).to.be.an('object');
    expect(mqttSensorPublisher).to.have.all.keys(['publishUpdate']);
  });

  describe.skip('publishUpdate', function() {
    describe('with no arguments', function() {
      it('should publish an update for every prop', function() {
        mqttSensorPublisher.publishUpdate(null, 'sandwich');
        expect(mqttService.sendMessage.callCount).to.equal(1);
        expect(mqttService.sendMessage.calledWithExactly(completeUpdate, 'sandwich')).to.be.true;
      });
    });

    describe('with an array containing an invalid prop', function() {
      it('should publish an update for every prop', function() {
        mqttSensorPublisher.publishUpdate(['nonexistent'], 'sandwich');
        expect(mqttService.sendMessage.callCount).to.equal(1);
        expect(mqttService.sendMessage.calledWithExactly(completeUpdate, 'sandwich')).to.be.true;
      });
    });

    describe('with a single valid prop', function() {
      it('should publish an update for that prop', function() {
        mqttSensorPublisher.publishUpdate(['fan'], 'sandwich');
        expect(mqttService.sendMessage.callCount).to.equal(1);
        expect(mqttService.sendMessage.calledWithExactly(',fan,0,one', 'sandwich')).to.be.true;
      });
    });
  });
});
