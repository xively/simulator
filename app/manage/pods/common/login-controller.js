'use strict';

module.exports = [
  'Login',
  'automaticLoginInfo',
  '$scope',
  '$rootScope',
  function(Login, automaticLoginInfo, $scope, $rootScope) {
    $scope.isLoggedIn = false;
    $scope.displayVirtualDevice = false;
    $scope.demoMode = false;
    $scope.noHeaderMode = false;

    // Toggle the virtual device state
    $scope.$on('toggleVirtualDevice', function(e, deviceId) {
      $scope.displayVirtualDevice = !$scope.displayVirtualDevice;
      // We can't use Angular templates for this because of SCE
      $scope.virtualDeviceUrl = '/virtual-device/#/' + deviceId;
      $scope.showIphoneFrame = $scope.displayVirtualDevice;
    });

    // On all successful state changes we close the virtual device frame
    $rootScope.$on('$stateChangeSuccess', function() {
      $scope.displayVirtualDevice = false;
      $scope.showIphoneFrame = false;
      $scope.demoMode = false;
      $scope.noHeaderMode = false;
    });

    $rootScope.$on('toggleDemo', function(event, value) {
      $scope.showIphoneFrame = value;
      $scope.demoMode = value;
    });

    $rootScope.$on('toggleHeader', function(event, value) {
      $scope.noHeaderMode = value;
    });

    Login.token()
    .then(function() {
      $scope.$apply(function() {
        $scope.isLoggedIn = true;
      });
    });

    Login.renew()
    .catch(function() {
      return Login.login({
        accountId: automaticLoginInfo.accountId,
        emailAddress: automaticLoginInfo.emailAddress,
        password: automaticLoginInfo.password,
      });
    });
  },
];
