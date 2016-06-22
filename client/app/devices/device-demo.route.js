const _ = require('lodash')

const shareIcon = require('./images/share-icon.svg')
const rulesIcon = require('../navigation/images/rules-icon.svg')
const settingsIcon = require('../navigation/images/settings-icon.svg')
const xiLogo = require('./images/xi-logo.svg')
const xivelyLogo = require('./images/xively-logo.png')
const xivelyLogoSimple = require('./images/xively-logo-simple.png')
const chevronLeft = require('./images/chevron-left.svg')
const chevronRight = require('./images/chevron-right.svg')
const buttonPlay = require('./images/button-play.svg')
const buttonPause = require('./images/button-pause.svg')

require('./device-demo.route.less')

/* @ngInject */
function deviceDemoRoute ($stateProvider) {
  $stateProvider.state('devices.device-demo', {
    url: '/:id/demo?header',
    template: `
      <div class="device-demo">
        <modal name="rules">
          <rules></rules>
        </modal>

        <modal name="settings">
          <settings></settings>
        </modal>
        <!--
        <div class="modal" ng-click="demo.closeModals()" ng-show="demo.modals.rules">
          <div class="content modal-body" ng-click="demo.block($event)">
            <div class="modal-header">
              <div class="close" ng-click="demo.toggleModal('rules')">✕</div>
            </div>
            <div class="modal-content">
              <rules></rules>
            </div>
          </div>
        </div>

        <div class="modal" ng-click="demo.closeModals()" ng-show="demo.modals.settings">
          <div class="content modal-body" ng-click="demo.block($event)">
            <div class="modal-header">
              <div class="close" ng-click="demo.toggleModal('settings')">✕</div>
            </div>
            <div class="modal-content">
              <settings></settings>
            </div>
          </div>
        </div>
        -->

        <div class="left-side" ng-show="demo.mobileView">
          <div class="chevron-left" ng-click="demo.toggleMobileView()" ng-show="demo.mobileView"> ${chevronLeft} </div>
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
                <a class="share" ng-click="demo.toggleShareModal()"> ${shareIcon} </a>
              </div>
              <device-panel device="demo.device"></device-panel>
            </div>
            <share-modal link="demo.shareLink" toggle="demo.toggleShareModal()" ng-show="demo.shareModal"></share-modal>
            <boldchat></boldchat>
          </iphone-frame>
        </div>
        <div class="right-side">
          <div class="navigation">
            <div class="navigation-container">
              <div class="logo">
                <img src="${xivelyLogo}"></img>
              </div>
              <div class="navigation-items">
                <div class="navigation-item" ng-click="demo.toggleSimulation()">
                  <span class="navigation-item-icon" ng-hide="demo.device.simulate">${buttonPlay}</span>
                  <span class="navigation-item-icon pause-button" ng-show="demo.device.simulate">${buttonPause}</span>
                  <span class="navigation-item-text">{{ demo.device.simulate ? '\&nbsp;Stop\&nbsp;' : 'Start' }} simulation</span>
                </div>
                <div class="navigation-item" ng-click="demo.openModal('settings')">
                  <span class="navigation-item-icon">${settingsIcon}</span>
                  <span class="navigation-item-text">Settings</span>
                </div>
                <div class="navigation-item" ng-click="demo.openModal('rules')">
                  <span class="navigation-item-icon">${rulesIcon}</span>
                  <span class="navigation-item-text">Rules</span>
                </div>
                <a class="navigation-item logo" href="{{ demo.cpmLink }}" target="_blank">
                  <span class="navigation-item-icon">${xiLogo}</span>
                  <span class="navigation-item-text">CPM</span>
                </a>
              </div>
            </div>
          </div>
          <div class="device-controls">
            <div class="chevron-right" ng-click="demo.toggleMobileView()" ng-show="!demo.mobileView"> ${chevronRight} </div>
            <div class="device-header">
              <div class="device-serial">
                {{ ::demo.device.serialNumber }}
              </div>
               <div class="navigation-dropdown">
                <select
                  ng-model="demo.navigation.selectedOption"
                  ng-change="demo.navigation.selectedOption.navigate()"
                  ng-options="deviceLink.name for deviceLink in demo.navigation.availableOptions track by deviceLink.device.deviceTemplateId">
                </select>
              </div>
            </div>
            <div class="device-container" style="width: {{ ::demo.config.width }}px; height: {{ ::demo.config.height }}px" ng-if="demo.config.image">
              <div ng-repeat="(name, sensor) in ::demo.config.sensors">
                <tooltip ng-if="sensor.tooltip"
                  options="sensor"
                  label="name"
                  value="demo.device.sensors[name].numericValue"
                  update="demo.update(name, value)"
                  device="demo.device">
                </tooltip>
                <div ng-if="sensor.widget" bind-html-compile="demo.getHtml(sensor.widget)"></div>
              </div>
              <img class="device-image" src="{{ demo.config.image }}" />
            </div>
            <div class="no-image" ng-if="!demo.config.image">
              <h2>No image available</h2>
            </div>

            <div class="device-control-sliders" ng-if="demo.sensorsNotConfigured.length">
              <div class="header row">
                <div class="channel-name">Channel name</div>
                <div class="control">Control</div>
                <div class="value">Value</div>
              </div>
              <div class="row" ng-repeat="(name, sensor) in demo.device.sensors" ng-if="demo.sensorsNotConfigured.indexOf(name) > -1">
                <div class="channel-name">{{ name }}</div>
                <div class="control">
                  <input type="range" min="0" max="100" ng-model="demo.sensors[name]" ng-change="demo.update(name, demo.sensors[name])" ng-disabled="!demo.device.ok">
                </div>
                <div class="value">
                  {{ demo.sensors[name] }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `,
    controllerAs: 'demo',
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
    controller ($log, $scope, $rootScope, $state, $location, $window, $document, device, templates, devicesService, socketService, modalService, DEVICES_CONFIG, CONFIG, EVENTS, segment) {
      device.template = templates[device.deviceTemplateId]
      this.config = DEVICES_CONFIG[device.template.name] || {}

      const EXCLUDED_INFO_FIELDS = ['excludedInfoFields', 'simulate', 'subscribe', 'template', 'update', 'sensors', 'ok', 'channels']
      device.excludedInfoFields = EXCLUDED_INFO_FIELDS
      .concat(DEVICES_CONFIG.general.excludedDeviceInfoFields, this.config.excludedDeviceInfoFields)
      .filter(Boolean)
      .map((fieldName) => {
        return fieldName.toLowerCase()
      })

      this.sensorsNotConfigured = _.reduce(device.sensors, (sensors, sensor, name) => {
        const configured = this.config.sensors && this.config.sensors[name] && (this.config.sensors[name].tooltip || this.config.sensors[name].widget)
        if (!configured) {
          sensors.push(name)
        }
        return sensors
      }, [])

      this.sensors = this.sensorsNotConfigured.reduce((sensors, key) => {
        sensors[key] = 50
        return sensors
      }, {})

      $scope.$watch(() => device.sensors, (sensors) => {
        _.forEach(sensors, (sensor, name) => {
          this.sensors[name] = sensor.numericValue
        })
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
          device: _.find(devices, {deviceTemplateId: id}),
          navigate () {
            segment.track(EVENTS.TRACKING.NEW_DEVICE_SELECTED_DROPDOWN, {
              deviceName: this.device.name,
              deviceId: this.device.id
            })

            $state.go('devices.device-demo', {id: this.device.id})
          }
        })).filter((option) => option.device)

        const selectedOption = _.find(availableOptions, {name: device.template.name})

        this.navigation = {
          availableOptions,
          selectedOption
        }
      })

      this.openModal = (name) => {
        if (name === 'rules' && CONFIG.habanero.embedded) {
          return $window.open('/goto-orchestrator', '_blank')
        }
        modalService.open(name)
      }

      this.block = ($event) => {
        $event.stopPropagation()
      }

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
        const {name, position} = widget
        return `<${name} device="demo.device" style="position: absolute; top: ${position.top}px; left: ${position.left}px"></${name}>`
      }

      this.shareLink = $location.absUrl().replace(/\/demo.*/, '?navigation=0')
      this.toggleShareModal = () => {
        this.shareModal = !this.shareModal
      }

      // FIXME workaround
      this.cpmLink = `https://${CONFIG.account.idmHost.replace('id.', 'app.')}/login?accountId=${CONFIG.account.accountId}`

      // toggle mobile visibility
      this.mobileView = true
      this.toggleMobileView = () => {
        this.mobileView = !this.mobileView
      }

      // track outbound CPM link
      segment.trackLink($document.find('a.navigation-item.logo'), EVENTS.TRACKING.CPM_LINK_CLICKED)
    }
  })
}

module.exports = deviceDemoRoute
