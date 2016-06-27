require('./nest-display.component.less')

/* @ngInject */
const nestDisplayComponent = {
  template: ``,
  bindings: {
    device: '='
  },
  controllerAs: 'display',
  controller ($scope, $log, $stateParams, $http, DEVICES_CONFIG, devicesService, socketService) {
  	var device = this.device
      $scope.$watch(() => {
      return this.device.sensors.state.numericValue
    }, (newValue) => {
      // This handles lock state change
      // 0 means that the lock is unlocked
      // 1 means that the lock is locked
      // apply state change on UI
      //$scope.lockState = newValue === 0 ? UNLOCKED : LOCKED
      device.sensors.state.numericValue = newValue
      console.log("NEW VALIE: ", newValue)
    })
  }
}

module.exports = nestDisplayComponent
