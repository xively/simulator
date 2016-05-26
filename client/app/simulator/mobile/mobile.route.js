/* @ngInject */
function mobileRoute ($stateProvider) {
  $stateProvider.state('mobile', {
    url: 'devices/:id/mobile',
    template: `
      <header-bar></header-bar>
      <device-panel device="mobile.device"></device-panel>
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
          .catch(() => {
            // TODO handle rejection
          })
      }
    },
    controllerAs: 'mobile',
    /* @ngInject */
    controller (device) {
      this.device = device
    }
  })
}

module.exports = mobileRoute
