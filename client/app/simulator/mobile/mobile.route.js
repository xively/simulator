/* @ngInject */
function mobileRoute ($stateProvider) {
  $stateProvider.state('mobile', {
    url: '/devices/:id/mobile',
    template: `
      <mobile device="mobile.device"></mobile>
    `,
    resolve: {
      /* @ngInject */
      device: ($q, $stateParams, devicesService) => {
        const id = $stateParams.id
        return $q.all([
          devicesService.getDevice(id),
          devicesService.getDeviceTemplates()
        ])
          .then(([device, templates]) => {
            device.template = templates[device.deviceTemplateId]
            return device
          })
      }
    },
    controllerAs: 'mobile',
    /* @ngInject */
    controller ($log, $scope, device, socketService) {
      this.device = device
      socketService.connect(this.device, (err, { simulate = false } = {}) => {
        if (err) {
          $log.error(err)
        }

        this.device.simulate = simulate
        this.device.ok = true
      })
      // subscribe for mqtt messages
      const unsubscribe = this.device.subscribe()
      $scope.$on('$stateChangeStart', () => {
        socketService.disconnect(this.device)
        unsubscribe()
      })
    }
  })
}

module.exports = mobileRoute
