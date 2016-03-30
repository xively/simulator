'use strict';

var MqttClientWrapper = require('../../../app/manage/pods/common/mqtt-client-wrapper');

describe('MqttClientWrapper', function() {
  describe('api', function() {
    it('should export the constructor', function() {
      expect(MqttClientWrapper).to.be.a('function');
    });

    it('should export the underlying MQTT lib', function() {
      expect(MqttClientWrapper.MqttClient).to.be.an('object');
    });
  });

  describe('instance', function() {
    beforeEach(function() {
      var client = this.client = {};
      client.connect = sinon.stub();
      client.subscribe = sinon.stub();
      client.unsubscribe = sinon.stub();
      client.send = sinon.stub();
      MqttClientWrapper.MqttClient = {
        get: function() {
          return client;
        },
      };
      this.mqttClient = new MqttClientWrapper({});
    });

    describe('Constructor', function() {
      it('should create a client property and connect', function() {
        expect(this.mqttClient.client).to.be.an('object');
        expect(this.mqttClient.client.connect.called).to.be.ok;
      });
    });

    describe('subscribe', function() {
      it('should throw if required options are missing', function() {
        var mqttClient = this.mqttClient;
        expect(function() {
          mqttClient.subscribe();
        }).to.throw(TypeError);
        expect(function() {
          mqttClient.subscribe({topic: 'foo'});
        }).to.throw(TypeError);
        expect(function() {
          mqttClient.subscribe({callback: function() {}
        }); }).to.throw(TypeError);
        expect(function() {
          mqttClient.subscribe({topic: 'foo', callback: function() {}
        }); }).to.not.throw(Error);
      });

      it('understands sensor payload', function() {
        var client = this.client;
        var mqttClient = this.mqttClient;
        mqttClient.subscribe({
          topic: 'fake/topic',
          callback: function(value, sensor) {
            if (sensor === 'fan') {
              expect(value).to.equal(0);
            } else if (sensor === 'filter') {
              expect(value).to.equal(100);
            } else {
              expect(false, 'sensor to be fan or filter').to.be.ok;
            }
          },
        });
        mqttClient.subscribe({
          topic: 'fake/topic',
          sensor: 'filter',
          callback: function(value, sensor) {
            expect(sensor).to.equal('filter');
            expect(value).to.equal(100);
          },
        });
        client.subscribe.args[0][1]({payloadString: ',fan,0,'});
        client.subscribe.args[0][1]({payloadString: ',fan,0,\n,filter,100,'});
      });
    });

    describe('unsubscribe', function() {
      it('should throw if required options are missing', function() {
        var mqttClient = this.mqttClient;
        expect(function() {
          mqttClient.unsubscribe();
        }).to.throw(TypeError);
        expect(function() {
          mqttClient.unsubscribe({topic: 'foo'});
        }).to.not.throw(Error);
      });
    });

    describe('sendSensorData', function() {

      it('should format sensor data', function() {
        var client = this.client;
        var mqttClient = this.mqttClient;

        mqttClient.sendSensorData('fake/topic', {fan: 0, filter: 100});
        expect(client.send.args[0][1])
        .to.have.property('payloadString')
        .and.to.equal(',fan,0,\n,filter,100,');

        mqttClient.sendSensorData('fake/topic', 'fan', 0);
        expect(client.send.args[1][1])
        .to.have.property('payloadString')
        .and.to.equal(',fan,0,');
      });

      it('should retain sensor data', function() {
        var client = this.client;
        var mqttClient = this.mqttClient;

        mqttClient.sendSensorData('fake/topic', {fan: 0, filter: 100});
        expect(client.send.args[0][1])
        .to.have.property('retained')
        .and.to.equal(true);

        mqttClient.sendSensorData('fake/topic', 'fan', 0);
        expect(client.send.args[1][1])
        .to.not.have.property('retained');
      });

    });
  });
});
