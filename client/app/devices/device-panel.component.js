const _ = require('lodash')

require('./device-panel.component.less')

const devicePanelComponent = {
  template: `
    <div class="device-panel">
      <div class="control-panel content">
        <div class="section">
          <h1 class="type">{{ ::devicePanel.device.template.name }}</h1>
          <p class="name">{{ ::devicePanel.device.serialNumber }}</p>
          <p class="username">{{ ::devicePanel.endUser.name }}</p>
          <p class="email">{{ ::devicePanel.config.account.emailAddress }}</p>
        </div>
        <div class="section" bind-html-compile="devicePanel.widgets()">
        </div>
      </div>
      <div class="status-panel">
        <div class="content">
          <h2>Right now:</h2>
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
        <div class="content">
          <select
            ng-model="devicePanel.timeseries.selectedOption"
            ng-options="channel.channelTemplateName for channel in devicePanel.timeseries.availableOptions track by channel.channelTemplateId">
          </select>
          <timeseries-chart device="devicePanel.device" channel="devicePanel.timeseries.selectedOption"></timeseries-chart>
        </div>
      </div>
    </div>
  `,
  bindings: {
    device: '='
  },
  controllerAs: 'devicePanel',
  /* @ngInject */
  controller ($log, $scope, socketService, blueprintService, CONFIG, DEVICES_CONFIG, EVENTS) {
    this.config = CONFIG
    const deviceConfig = DEVICES_CONFIG[this.device.template.name] || {}
    this.deviceConfig = deviceConfig
    blueprintService.getV1('end-users', { organizationId: this.device.organizationId }).then((response) => {
      if (response.data) {
        const endUsers = response.data.endUsers.results
        this.endUser = endUsers[0]
      }
    })

    // start virtual device
    socketService.connect(this.device, (err, { ok = true, simulate = false } = {}) => {
      if (err) {
        ok = false
        $log.error(err)
      }
      this.device.simulate = simulate
      // TODO not sure if we need this later
      // this.device.ok = ok
      this.device.ok = true
    })
    // subscribe for mqtt messages
    const unsubscribe = this.device.subscribe()
    $scope.$on('$stateChangeStart', () => {
      socketService.disconnect(this.device)
      unsubscribe()
    })

    this.widgets = () => {
      if (deviceConfig && deviceConfig.widgets) {
        return deviceConfig.widgets.map((name) => `<${name} device="devicePanel.device"></${name}>`).join('')
      }
    }

    const timeseriesChannels = this.device.channels
      .filter((channel) => channel.persistenceType === 'timeSeries')
    const selectedOption = deviceConfig.defaultSensor ? _.find(timeseriesChannels, { channelTemplateName: deviceConfig.defaultSensor }) : timeseriesChannels[0]
    this.timeseries = {
      availableOptions: timeseriesChannels,
      selectedOption
    }
  }
}

module.exports = devicePanelComponent
