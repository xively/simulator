'use strict';

var ngModule = angular.mock.module;

describe('cycleFan', function() {
  beforeEach(function() {
    ngModule('purifier.sensor');

    ngModule(function($provide) {
      $provide.value('sensorProps', {
        fan: {
          initial: 0,
          min: 0,
          max: 3,
          map: ['one', 'two', 'three', 'four'],
        },
      });

      $provide.factory('sensorStore', function() {
        return {
          get: function() {
            return 0;
          },
        };
      });
    });
  });

  var cycleFan;
  beforeEach(inject(function(_cycleFan_) {
    cycleFan = _cycleFan_;
  }));

  it('should be a function', function() {
    expect(cycleFan).to.be.a('function');
  });

  it('should return an integer, moving the fan up a notch from its current position', function() {
    expect(cycleFan()).to.equal(1);
  });
});