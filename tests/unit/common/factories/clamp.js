'use strict';

var ngModule = angular.mock.module;

describe('clamp', function() {
  beforeEach(function() {
    ngModule('common');
  });

  var clamp;
  beforeEach(inject(function(_clamp_) {
    clamp = _clamp_;
  }));

  it('should be a function', function() {
    expect(clamp).to.be.a('function');
  });

  it('should return the same number when it is passed within range', function() {
    expect(clamp(5, 0, 10)).to.equal(5);
  });

  it('should return the min number when it is below the range', function() {
    expect(clamp(-2, 0, 10)).to.equal(0);
  });

  it('should return the max number when it is above the range', function() {
    expect(clamp(12, 0, 10)).to.equal(10);
  });
});
