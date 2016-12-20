const _ = require('lodash')

require('./device-panel.component.less')
const shareIcon = require('./images/share-icon.svg')

const devicePanelComponent = {
  template: `
    <modal name="share" width="355px" height="455px">
      <share link="devicePanel.link"></share>
    </modal>
    <div class="control-panel content">
      <div class="section">
        <h1 class="type">{{ ::devicePanel.device.template.name }}</h1>
        <p class="name">{{ ::devicePanel.device.serialNumber }}</p>
        <p class="username">{{ ::devicePanel.endUser.name }}</p>
        <p class="email">{{ ::devicePanel.config.account.emailAddress }}</p>
        <div class="share-icon" ng-click="devicePanel.openShareModal()">${shareIcon}</div>
      </div>
      <div class="section" bind-html-compile="devicePanel.widgets()">
      </div>
    </div>
    <div class="status-panel">
      <div class="content">
        <h2>Right now</h2>
        <div class="sensor-panels">
          <div class="panel" ng-repeat="(name, sensor) in devicePanel.device.sensors">
            <p class="name">{{ ::name }}</p>
            <p class="value">
              {{ sensor.numericValue }}
              <span>{{ ::devicePanel.deviceConfig.sensors[name].unit }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="content device-info">
        <h2 ng-click="devicePanel.toggleInfoPanel()">
          Device info
          <span class="pull-right chevron" ng-class="{rotate: devicePanel.infoPanelOpen}"></span>
        </h2>
        <div collapse is-open="devicePanel.infoPanelOpen" class="device-fields">
          <div class="device-panel-content">
            <div class="device-info-fields">
              <div class="row" ng-repeat="(key, value) in devicePanel.device" ng-if="devicePanel.device.excludedInfoFields.indexOf(key.toLowerCase()) === -1">
                <div class="field-name">{{ ::key }}</div>
                <div class="field-value">
                  <span ng-if="!devicePanel.editingInfoFields">{{ value }}</span>
                  <input type="text" ng-if="devicePanel.editingInfoFields" ng-model="devicePanel.device[key]" />
                </div>
              </div>
            </div>

            <div>
              <button type="button" class="button primary" ng-if="!devicePanel.editingInfoFields" ng-click="devicePanel.editInfoFields()">
                Edit
              </button>
              <button type="button" class="button secondary" ng-if="devicePanel.editingInfoFields" ng-click="devicePanel.updateInfoFields()">
                Save
              </button>
              <button type="button" class="button delete" ng-if="devicePanel.editingInfoFields" ng-click="devicePanel.cancelInfoFieldsEditing()">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="content">
        <select
          ng-model="devicePanel.timeseries.selectedOption"
          ng-options="channel.channelTemplateName for channel in devicePanel.timeseries.availableOptions track by channel.channelTemplateId">
        </select>
        <timeseries-chart device="devicePanel.device" channel="devicePanel.timeseries.selectedOption"></timeseries-chart>
      </div>
    </div>
  `,
  bindings: {
    device: '='
  },
  controllerAs: 'devicePanel',
  /* @ngInject */
  controller ($log, $scope, socketService, blueprintService, modalService, CONFIG, DEVICES_CONFIG, $location) {
    this.config = CONFIG

    this.link = $location.protocol() + '://' + $location.host()

    if ($location.port() !== 80 && $location.port() !== 443) {
      this.link += ':' + $location.port().toString()
    }

    this.link += '/#/devices/' + this.device.id + '/mobile'

    this.openShareModal = () => {
      modalService.open('share')
    }

    const EXCLUDED_INFO_FIELDS = ['excludedInfoFields', 'simulate', 'subscribe', 'template', 'update', 'sensors', 'ok', 'channels']
    this.device.excludedInfoFields = EXCLUDED_INFO_FIELDS
      .concat(DEVICES_CONFIG.general.excludedDeviceInfoFields, this.config.excludedDeviceInfoFields)
      .filter(Boolean)
      .map((fieldName) => {
        return fieldName.toLowerCase()
      })

    const deviceConfig = DEVICES_CONFIG[this.device.template.name] || {}
    this.deviceConfig = deviceConfig
    blueprintService.getV1('end-users', { organizationId: this.device.organizationId }).then((response) => {
      if (response.data) {
        const endUsers = response.data.endUsers.results
        this.endUser = endUsers[0]
      }
    })

    this.widgets = () => {
      if (deviceConfig && deviceConfig.widgets) {
        return deviceConfig.widgets.map((name) => `<${name} device="devicePanel.device"></${name}>`).join('')
      }
    }

    this.infoPanelOpen = false
    this.toggleInfoPanel = () => {
      this.infoPanelOpen = !this.infoPanelOpen
    }

    const timeseriesChannels = this.device.channels
      .filter((channel) => channel.persistenceType === 'timeSeries')
    const selectedOption = deviceConfig.defaultSensor ? _.find(timeseriesChannels, { channelTemplateName: deviceConfig.defaultSensor }) : timeseriesChannels[0]
    this.timeseries = {
      availableOptions: timeseriesChannels,
      selectedOption
    }

    let deviceCopy
    this.editInfoFields = () => {
      this.editingInfoFields = true
      deviceCopy = _.cloneDeep(this.device)
    }

    this.cancelInfoFieldsEditing = () => {
      this.editingInfoFields = false
      Object.assign(this.device, deviceCopy)
    }

    this.updateInfoFields = () => {
      const data = _.reduce(this.device, (result, value, key) => {
        if (!this.device.excludedInfoFields.includes(key.toLowerCase())) {
          result[key] = value
        }
        return result
      }, {})

      blueprintService.updateDevice(this.device.id, data)
        .then(() => {
          this.editingInfoFields = false
        })
    }
  }
}

module.exports = devicePanelComponent
