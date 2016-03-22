'use strict';

var ngModule = angular.mock.module;

describe('sensorStore', function() {
  beforeEach(function() {
    ngModule('purifier.sensor');

    ngModule(function($provide) {
      $provide.value('sensorProps', {
        something: {
          initial: 5,
          max: 10,
          min: 0,
        },
      });
    });
  });

  var sensorStore;
  beforeEach(inject(function(_sensorStore_) {
    sensorStore = _sensorStore_;
  }));

  it('should be an Object with a `get` and `set` method', function() {
    expect(sensorStore).to.be.an('object');
    expect(sensorStore).to.have.all.keys(['get', 'set']);
  });

  describe('set', function() {
    it.skip('should return false for values that arent in the store', function() {
      expect(sensorStore.set('sandwich', 2)).to.be.false;
    });

    it('should return false for values that are in the store but are not numbers', function() {
      expect(sensorStore.set('something', 'yum')).to.be.false;
    });

    it('should return false for values that are unchanged', function() {
      expect(sensorStore.set('something', 5)).to.be.false;
    });

    it('should return true for values that are in the store but are out of range', function() {
      expect(sensorStore.set('something', -1)).to.be.true;
      expect(sensorStore.set('something', 11)).to.be.true;
    });

    it('should return true for values that pass validation', function() {
      expect(sensorStore.set('something', 7)).to.be.true;
    });
  });

  describe('get', function() {
    it('should return undefined for nonexistent keys', function() {
      expect(sensorStore.get('hello')).to.be.undefined;
    });

    it('should return the correct value for an existing key', function() {
      expect(sensorStore.get('something')).to.equal(5);
    });

    it('should return the correct value for an existing key after setting it', function() {
      sensorStore.set('something', 1);
      expect(sensorStore.get('something')).to.equal(1);
    });

    it('should adjust the value to be clamped to the max and min', function() {
      sensorStore.set('something', -1);
      expect(sensorStore.get('something')).to.equal(0);

      sensorStore.set('something', 20);
      expect(sensorStore.get('something')).to.equal(10);
    });
  });
});
