const _ = require('lodash')

const shareIcon = require('./images/share-icon.svg')
const rulesIcon = require('../navigation/images/rules-icon.svg')
const settingsIcon = require('../navigation/images/settings-icon.svg')
const xiLogo = require('./images/xi-logo.svg')
const xivelyLogo = require('./images/xively-logo.png')
const xivelyLogoSimple = require('./images/xively-logo-simple.png')

require('./device-demo.route.less')

/* @ngInject */
function deviceDemoRoute ($stateProvider) {
  $stateProvider.state('devices.device-demo', {
    url: '/:id/demo?header',
    template: `
      <div class="device-demo">
        <div class="left-side">
          <iphone-frame>
            <notification></notification>
            <div class="iphone-frame-scrollable">
              <div class="navigation-header">
                <div class="logo">
                  <img src="${xivelyLogoSimple}"></img>
                  <div>Product Simulator</div>
                </div>
              </div>
              <div class="icons">
                <a class="share" ng-click="device.toggleShareModal()"> ${shareIcon} </a>
              </div>
              <device-panel device="device.device"></device-panel>
            </div>
            <share-modal link="device.shareLink" toggle="device.toggleShareModal()" ng-show="device.shareModal"></share-modal>
            <boldchat></boldchat>
          </iphone-frame>
        </div>
        <div class="right-side">
          <div class="navigation">
            <div class="navigation-container">
              <div class="navigation-dropdown">
                <select
                  ng-model="device.navigation.selectedOption"
                  ng-change="device.navigation.selectedOption.navigate()"
                  ng-options="deviceLink.name for deviceLink in device.navigation.availableOptions track by deviceLink.device.deviceTemplateId">
                </select>
                <div class="simulate-button" ng-click="device.toggleSimulation()">
                  {{ device.device.simulate ? 'Stop' : 'Start' }} simulation
                </div>
              </div>
              <div class="navigation-items">
                <div class="navigation-item" ui-sref="rules" ui-sref-active="active">
                  <span class="navigation-item-icon">${rulesIcon}</span>
                  <span class="navigation-item-text">Rules</span>
                </div>
                <div class="navigation-item" ui-sref="settings" ui-sref-active="active">
                  <span class="navigation-item-icon">${settingsIcon}</span>
                  <span class="navigation-item-text">Settings</span>
                </div>
                <a class="navigation-item logo" href="{{ device.cpmLink }}" target="_blank">
                  <span class="navigation-item-icon">${xiLogo}</span>
                  <span class="navigation-item-text">CPM</span>
                </a>
              </div>
            </div>
          </div>
          <div class="device-controls">
            <div class="device-header">
              <div class="device-serial">
                {{ ::device.device.serialNumber }}
              </div>
              <div class="xively-logo">
                <div class="powered-by">Powered by</div>
                <img src="${xivelyLogo}"></img>
              </div>
            </div>
            <div class="device-container" style="width: {{ ::device.config.width }}px" ng-if="device.config.image">
              <div ng-repeat="(name, sensor) in ::device.config.sensors">
                <tooltip ng-if="sensor.tooltip"
                  options="sensor"
                  label="name"
                  value="device.device.sensors[name].numericValue"
                  update="device.update(name, value)"
                  device="device.device">
                </tooltip>
                <div ng-if="sensor.widget" bind-html-compile="device.getHtml(sensor.widget)"></div>
              </div>
              <img class="device-image" src="{{ device.config.image }}" />
            </div>
            <div class="no-image" ng-if="!device.config.image">
              <h2>No image available</h2>
            </div>
            <div class="device-control-sliders" ng-if="device.sensorsNotConfigured.length">
              <div class="header row">
                <div class="channel-name">Channel name</div>
                <div class="control">Control</div>
                <div class="value">Value</div>
              </div>
              <div class="row" ng-repeat="(name, sensor) in device.device.sensors" ng-if="device.sensorsNotConfigured.indexOf(name) > -1">
                <div class="channel-name">{{ name }}</div>
                <div class="control">
                  <input type="range" min="0" max="100" ng-model="device.sensors[name]" ng-change="device.update(name, device.sensors[name])" ng-disabled="!device.device.ok">
                </div>
                <div class="value">
                  {{ device.sensors[name] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    controllerAs: 'device',
    resolve: {
      /* @ngInject */
      templates (devicesService) {
        return devicesService.getDeviceTemplates()
      },
      /* @ngInject */
      device ($stateParams, $state, devicesService) {
        const id = $stateParams.id
        return devicesService.getDevice(id)
          .catch(() => $state.go('devices'))
      }
    },
    /* @ngInject */
    controller ($log, $scope, $rootScope, $state, $location, device, templates, devicesService, socketService, DEVICES_CONFIG, CONFIG, EVENTS) {
      device.template = templates[device.deviceTemplateId]
      this.config = DEVICES_CONFIG[device.template.name] || {}
      this.sensorsNotConfigured = _.pullAll(Object.keys(device.sensors), Object.keys(this.config.sensors || {}))
      this.sensors = this.sensorsNotConfigured.reduce((sensors, key) => {
        sensors[key] = 50
        return sensors
      }, {})
      $scope.$watch(() => device.sensors, (sensors) => {
        _.forEach(sensors, (sensor, name) => { this.sensors[name] = sensor.numericValue })
      }, true)
      this.device = device

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
      devicesService.getDevices().then((devices) => {
        const availableOptions = _.map((templates), (template, id) => ({
          name: template.name,
          device: _.find(devices, { deviceTemplateId: id }),
          navigate () {
            $state.go('devices.device-demo', { id: this.device.id })
          }
        })).filter((option) => option.device)

        const selectedOption = _.find(availableOptions, { name: device.template.name })

        this.navigation = {
          availableOptions,
          selectedOption
        }
      })

      // simulate
      this.toggleSimulation = () => {
        this.device.simulate = !this.device.simulate
        if (this.device.simulate) {
          socketService.startSimulation(device)
        } else {
          socketService.stopSimulation(device)
        }
      }

      $scope.$on('stopSimulation', () => {
        this.device.simulate = false
      })

      // update sensor value
      this.update = _.debounce(device.update, 100)

      // get html for a widget element
      this.getHtml = (widget) => {
        const { name, position } = widget
        return `<${name} device="device.device" style="position: absolute; top: ${position.top}px; left: ${position.left}px"></${name}>`
      }

      this.shareLink = $location.absUrl().replace(/\/demo.*/, '?navigation=0')
      this.shareModal = false
      this.toggleShareModal = () => {
        this.shareModal = !this.shareModal
      }

      // FIXME workaround
      this.cpmLink = `https://${CONFIG.account.idmHost.replace('id.', 'app.')}/login?accountId=${CONFIG.account.accountId}`
    }
  })
}

module.exports = deviceDemoRoute
