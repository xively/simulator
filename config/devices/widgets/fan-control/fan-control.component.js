const _ = require('lodash')

require('./fan-control.component.less')

/* @ngInject */
const fanControlComponent = {
  template: `
    <div class="fan-control" ng-click="!fanControl.device.ok || fanControl.changeState()">
      <div class="purifier-device-switch">
      <div class="fan-speed-indicator" ng-class="'speed-' + fanControl.device.sensors.fan.numericValue"></div>
      <ul>
        <li>High</li>
        <li>Low</li>
        <li>Off</li>
      </ul>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  controllerAs: 'fanControl',
  /* @ngInject */
  controller (segment, EVENTS) {
    this.changeState = () => {
      if (!_.isNumber(this.device.sensors.fan.numericValue)) {
        this.device.sensors.fan.numericValue = 0
      }
      this.device.sensors.fan.numericValue = (this.device.sensors.fan.numericValue + 1) % 3
      this.device.update('speed', JSON.stringify({
        command: 'speed',
        option: ['off', 'low', 'high'][this.device.sensors.fan.numericValue]
      }))
      segment.track(EVENTS.TRACKING.SENSOR_VALUE_CHANGED_BUTTON, {
        deviceName: this.device.name,
        value: ['off', 'low', 'high'][this.device.sensors.fan.numericValue]
      })
    }
  }
}

module.exports = fanControlComponent
