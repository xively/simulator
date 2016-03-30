'use strict';

var ngModule = angular.mock.module;

describe('filterDepletion', function() {
  beforeEach(function() {
    ngModule('purifier.sensor');

    ngModule(function($provide) {
      $provide.factory('sensorStore', function() {
        return {
          // Our fan is on high, and there's a lot of dust. This simulates
          // an environment where the filter will deplete over time, once `init` is called.
          get: function(val) {
            if (val === 'fan') {
              return 2;
            } else if (val === 'dust') {
              return 500;
            } else if (val === 'filter') {
              return 1000;
            }
          },
          set: sinon.stub(),
        };
      });

      $provide.factory('mqttDeviceInfoPublisher', function() {
        return {
          publishFilterChange: sinon.stub(),
        };
      });

      $provide.factory('mqttSensorPublisher', function() {
        return {
          publishUpdate: sinon.stub(),
        };
      });
    });

    this.clock = sinon.useFakeTimers();
  });

  var filterDepletion, sensorStore, mqttDeviceInfoPublisher, $rootScope, mqttSensorPublisher;
  beforeEach(inject(
    function(_filterDepletion_, _sensorStore_, _mqttDeviceInfoPublisher_, _$rootScope_, _mqttSensorPublisher_) {
      filterDepletion = _filterDepletion_;
      sinon.spy(filterDepletion, 'setFilterLife');
      sensorStore = _sensorStore_;
      sinon.spy(sensorStore, 'get');
      mqttDeviceInfoPublisher = _mqttDeviceInfoPublisher_;
      $rootScope = _$rootScope_;
      sinon.stub($rootScope, '$broadcast');
      mqttSensorPublisher = _mqttSensorPublisher_;
    }
  ));

  afterEach(function() {
    this.clock.restore();
    $rootScope.$broadcast.restore();
    sensorStore.get.restore();
  });

  it('should be an Object', function() {
    expect(filterDepletion).to.be.an('object');
    var keys = ['init', 'setFilterLife', 'replaceFilter', 'depleteFilter', '_reduceFilterLife'];
    expect(filterDepletion).to.have.all.keys(keys);
  });

  describe('setFilterLife', function() {
    it('should call `set` on the `sensorStore`, coercing the value to a number', function() {
      filterDepletion.setFilterLife('3');
      expect(sensorStore.set.callCount).to.equal(1);
      expect(sensorStore.set.calledWithExactly('filter', 3)).to.be.true;
    });
  });

  describe('replaceFilter', function() {
    beforeEach(function() {
      filterDepletion.replaceFilter();
    });

    it('should set the filterLife to be 1000', function() {
      expect(filterDepletion.setFilterLife.callCount).to.equal(1);
      expect(filterDepletion.setFilterLife.calledWithExactly(1000)).to.be.true;
    });

    it('should publish an update over MQTT', function() {
      expect(mqttDeviceInfoPublisher.publishFilterChange.callCount).to.equal(1);
    });

    it('should update the life before it publishes the event', function() {
      expect(filterDepletion.setFilterLife.calledBefore(mqttDeviceInfoPublisher.publishFilterChange)).to.be.true;
    });

    it('should emit an update on the sensor channel', function() {
      expect(mqttSensorPublisher.publishUpdate.callCount).to.equal(1);
      expect(mqttSensorPublisher.publishUpdate.alwaysCalledWith(['filter'])).to.be.true;
    });
  });

  describe('depleteFilter', function() {
    beforeEach(function() {
      filterDepletion.depleteFilter();
    });

    it('should broadcast a filterDepletion event', function() {
      expect($rootScope.$broadcast.callCount).to.equal(1);
      expect($rootScope.$broadcast.calledWithExactly('device.filterDepleting', true)).to.be.true;
    });

    it('should update the value of the dust and fan', function() {
      expect(sensorStore.set.callCount).to.equal(2);
      expect(sensorStore.set.calledWith('fan', 2)).to.be.true;
      expect(sensorStore.set.calledWith('dust', 500)).to.be.true;
    });

    it('should $broadcast another filterDepletion after exactly 5 seconds, signaling that it is over', function() {
      this.clock.tick(4999);
      expect($rootScope.$broadcast.callCount).to.equal(1);
      this.clock.tick(5000);
      expect($rootScope.$broadcast.callCount).to.equal(2);
      expect($rootScope.$broadcast.calledWithExactly('device.filterDepleting', false)).to.be.true;
    });

    it('should change the filter life and publish an update 10 times over 5 seconds', function() {
      this.clock.tick(500);
      expect(filterDepletion.setFilterLife.callCount).to.equal(1);
      expect(mqttSensorPublisher.publishUpdate.callCount).to.equal(1);
      this.clock.tick(500);
      expect(filterDepletion.setFilterLife.callCount).to.equal(2);
      expect(mqttSensorPublisher.publishUpdate.callCount).to.equal(2);
      this.clock.tick(4000);
      expect(filterDepletion.setFilterLife.callCount).to.equal(10);
      expect(mqttSensorPublisher.publishUpdate.callCount).to.equal(10);
      this.clock.tick(5000);
      expect(filterDepletion.setFilterLife.callCount).to.equal(10);
      expect(mqttSensorPublisher.publishUpdate.callCount).to.equal(10);
    });

    // Only a single tick can be tested, as our sensorStore always returns 1000 for `filter`.
    it('should reduce the life of the filter after a tick', function() {
      this.clock.tick(500);
      var firstArg = filterDepletion.setFilterLife.args[0];
      expect(firstArg[0]).to.be.lessThan(1000);
    });
  });

  describe('init', function() {
    beforeEach(function() {
      filterDepletion.init();
    });

    it('should deplete the filter life after a second', function() {
      this.clock.tick(1000);
      expect(filterDepletion.setFilterLife.args[0][0]).to.be.lessThan(1000);
    });
  });
});
