'use strict';

var ngModule = angular.mock.module;

describe('randomInteger', function() {
  beforeEach(ngModule('common'));

  it('should be a function', inject(function(randomInteger) {
    expect(randomInteger).to.be.a('function');
  }));

  it('should return a number', inject(function(randomInteger) {
    expect(randomInteger(0, 5)).to.be.a('number');
  }));
});
