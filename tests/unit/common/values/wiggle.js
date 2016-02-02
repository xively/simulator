'use strict';

var ngModule = angular.mock.module;

describe('wiggle', function() {
  beforeEach(function() {
    // Load our purifier module
    ngModule('common');
  });

  it('should be a function', inject(function(wiggle) {
    expect(wiggle).to.be.a('function');
  }));

  it('should return a number', inject(function(wiggle) {
    expect(wiggle(0, 1)).to.be.a('number');
  }));
});
