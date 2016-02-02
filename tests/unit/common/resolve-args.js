'use strict';

var Promise = require('bluebird');

var resolveArgs = require('../../../app/manage/pods/common/utils/resolve-args');

describe('resolve-args', function() {
  var $rootScope;
  beforeEach(inject(function(_$rootScope_) {
    $rootScope = _$rootScope_;
  }));

  it('calls function wrapped with $scope or $scopeIndex', function() {
    var $scope = $rootScope.$new();
    var watchTriggered = 0;
    $scope.$watch('value', function() { watchTriggered++; });

    return Promise.all([
      resolveArgs({$scope: $scope, indices: []}, function() { $scope.value = 'a'; })(),
      resolveArgs({$scopeIndex: 0, indices: []}, function(scope) { scope.value = 'b'; })($scope),
      resolveArgs({indices: []}, function() { $scope.value = 'c'; })(),
    ])
    .then(function() {
      expect(watchTriggered).to.equal(2);
    });
  });

  it('resolves promises by indices', function() {
    return resolveArgs({indices: [1]}, function(a, b) {
      expect(a.then).to.be.a('function');
      expect(b).to.equal('b');
    })(Promise.resolve('a'), Promise.resolve('b'));
  });
});
