require('./device.route.less')
const shareIcon = require('./images/share-icon.svg')
const arrowCircleIcon = require('./images/arrow-circle-icon.svg')

/* @ngInject */
function deviceRoute ($stateProvider) {
  $stateProvider.state('devices.device', {
    url: '/:id',
    template: `
      <section class="device container">
        <div class="link-bar">
          <a class="back" ui-sref="devices.list">
            <span>&#9664;</span>
            Back to devices list
          </a>
          <div class="icons">
            <a class="share" ng-click="device.toggleShareModal()"> ${shareIcon} </a>
            <a class="arrow-circle" ui-sref="devices.device-demo({ id: device.device.id, header: 0 })"> ${arrowCircleIcon} </a>
          </div>
        </div>
        <device-panel device="device.device"></device-panel>
        <share-modal link="device.shareLink" toggle="device.toggleShareModal()" ng-show="device.shareModal"></share-modal>
        <boldchat></boldchat>
      </section>
    `,
    controllerAs: 'device',
    resolve: {
      /* @ngInject */
      device: ($q, $stateParams, $state, devicesService) => {
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
            $state.go('devices')
          })
      }
    },
    /* @ngInject */
    controller ($log, $scope, $location, device) {
      const unsubscribe = device.subscribe()
      $scope.$on('$destroy', unsubscribe)

      this.device = device

      this.shareLink = $location.absUrl()
      this.shareModal = false
      this.toggleShareModal = () => {
        this.shareModal = !this.shareModal
      }
    }
  })
}

module.exports = deviceRoute
