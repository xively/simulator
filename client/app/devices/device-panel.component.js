require('./device-panel.component.less')

const devicePanelComponent = {
  template: `
    <div class="device-panel">
      <notification></notification>
      <div class="control-panel content">
        <div class="section">
          <h1 class="type">{{ ::devicePanel.device.template.name }}</h1>
          <p class="name">{{ ::devicePanel.device.name }}</p>
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
              <p class="value">{{ sensor.numericValue }}</p>
            </div>
          </div>
        </div>
        <div class="content">
          <h2>Health Stats:</h2>
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
    device: '<'
  },
  controllerAs: 'devicePanel',
  /* @ngInject */
  controller ($log, $scope, CONFIG, DEVICES_CONFIG, socketService) {
    this.config = CONFIG
    const deviceConfig = DEVICES_CONFIG[this.device.template.name]

    // start virtual device
    socketService.connect(this.device)

    // subscribe for mqtt messages
    const unsubscribe = this.device.subscribe()
    $scope.$on('$destroy', () => {
      unsubscribe()
      socketService.disconnect(this.device)
    })

    this.widgets = () => {
      if (deviceConfig) {
        return deviceConfig.widgets.map((name) => `<${name} device="devicePanel.device"></${name}>`).join('')
      }
    }

    const timeseriesChannels = this.device.channels
      .filter((channel) => channel.persistenceType === 'timeSeries')
    this.timeseries = {
      availableOptions: timeseriesChannels,
      selectedOption: timeseriesChannels[0]
    }
  }
}

module.exports = devicePanelComponent
