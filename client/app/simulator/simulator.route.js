/* @ngInject */
function simulatorRoute ($stateProvider) {
  $stateProvider.state('simulator', {
    url: '/devices/:id',
    template: `
      <simulator
        templates="simulator.templates"
        device="simulator.device"
        devices="simulator.devices">
      </simulator>
    `,
    resolve: {
      /* @ngInject */
      templates (devicesService) {
        return devicesService.getDeviceTemplates()
      },
      /* @ngInject */
      device ($stateParams, $state, devicesService) {
        return devicesService.getDevice($stateParams.id)
          .catch(() => $state.go('deviceList'))
      },
      /* @ngInject */
      devices (devicesService) {
        return devicesService.getDevices()
      }
    },
    controllerAs: 'simulator',
    controller (templates, device, devices) {
      this.templates = templates
      this.device = device
      this.devices = devices
    }
  })
}

module.exports = simulatorRoute
