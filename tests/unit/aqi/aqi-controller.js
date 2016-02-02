'use strict';

var ngModule = angular.mock.module;

describe('aqiCtrl', function() {
  var $controller, $rootScope, $scope;
  beforeEach(function() {
    ngModule('aqi');
  });

  beforeEach(inject(function(_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  beforeEach(function() {
    $scope = $rootScope.$new();
    $scope.$apply = function(cb) {
      cb();
    };
    $controller('aqiCtrl', {$scope: $scope});
  });

  it('should set $scope.api to be a number', function() {
    expect($scope.aqi).to.be.a('number');
  });

  it('should respond to $rootScope events, updating the aqi', function() {
    $rootScope.$broadcast('aqi.update', 2);
    expect($scope.aqi).to.equal(2);
  });
});
