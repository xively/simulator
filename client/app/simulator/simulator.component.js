const _ = require('lodash')

const chevronLeft = require('./images/chevron-left.svg')
const chevronRight = require('./images/chevron-right.svg')

require('./simulator.component.less')

/* @ngInject */
const devicesComponent = {
  template: `
    <div class="simulator">
      <modal name="rules">
        <rules></rules>
      </modal>

      <modal name="settings">
        <settings></settings>
      </modal>

      <div class="left-side" ng-show="simulator.showMobile">
        <div class="chevron-left" ng-click="simulator.toggleMobileView()" ng-show="simulator.showMobile"> ${chevronLeft} </div>
        <iphone-frame>
          <mobile device="simulator.device"></mobile>
        </iphone-frame>
      </div>

      <div class="right-side">
        <div class="chevron-right" ng-click="simulator.toggleMobileView()" ng-show="!simulator.showMobile"> ${chevronRight} </div>
        <navigation device="simulator.device"></navigation>
        <virtual-device device="simulator.device" template-options="simulator.templateOptions"></virtual-device>
      </div>
    </div>
  `,
  controllerAs: 'simulator',
  bindings: {
    device: '=',
    devices: '=',
    templates: '='
  },
  /* @ngInject */
  controller ($rootScope, $scope, $state, $log, socketService, EVENTS) {
    this.device.template = this.templates[this.device.deviceTemplateId]
    $scope.$watch(() => this.device.ok, (ok, wasOk) => {
      if (!ok) {
        $rootScope.$broadcast(EVENTS.NOTIFICATION, {
          type: 'error',
          text: 'Your device reported a mailfunction. Please stand by, our agents are already aware of the issue and will have a look at it very soon.',
          sticky: true
        })
      } else if (!wasOk && ok) {
        $rootScope.$broadcast(EVENTS.NOTIFICATION, {
          type: 'success',
          text: 'The device has been fixed.'
        })
      }
    })

    // template navigation options
    this.templateOptions = _.map((this.templates), (template, id) => ({
      name: template.name,
      device: _.find(this.devices, { deviceTemplateId: id }),
      navigate () {
        $state.go('simulator', { id: this.device.id })
      }
    })).filter((option) => option.device)

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

    // toggle mobile visibility
    this.showMobile = true
    this.toggleMobileView = () => {
      this.showMobile = !this.showMobile
    }
  }
}

module.exports = devicesComponent
