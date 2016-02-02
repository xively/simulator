'use strict';

var ngModule = angular.mock.module;

describe('aqiService', function() {
  beforeEach(function() {
    ngModule('aqi');
    this.clock = sinon.useFakeTimers();

    ngModule(function($provide) {
      $provide.value('AqiData', {
        getLatestValue: function() {
          return {
            then: function(cb) {
              cb({
                value: 6,
              });
            },
          };
        },
      });
    });
  });

  var $rootScope, aqiService;
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
    sinon.stub($rootScope, '$broadcast');
  }));

  afterEach(function() {
    $rootScope.$broadcast.restore();
    this.clock.restore();
  });

  beforeEach(inject(function(_aqiService_) {
    aqiService = _aqiService_;
  }));

  it('should be an Object with an `init` method', function() {
    expect(aqiService).to.be.an('object');
    expect(aqiService).to.have.all.keys(['init', '_poll']);
  });

  it('should poll the server periodically', function() {
    aqiService.init();
    expect($rootScope.$broadcast.callCount).to.equal(1);
    this.clock.tick(5000);
    expect($rootScope.$broadcast.callCount).to.equal(2);
    expect($rootScope.$broadcast.alwaysCalledWith('aqi.update', 6)).to.be.true;
    this.clock.tick(5000);
    expect($rootScope.$broadcast.callCount).to.equal(3);
    expect($rootScope.$broadcast.args[1]).to.deep.equal(['aqi.update', 6]);
  });
});
