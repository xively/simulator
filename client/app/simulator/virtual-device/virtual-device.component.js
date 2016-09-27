const _ = require('lodash')

require('./virtual-device.component.less')

/* @ngInject */
const virtualDeviceComponent = {
  template: `
    <div class="device-header">
      <div class="device-serial">
        {{ ::virtualDevice.device.serialNumber }}
      </div>
       <div class="navigation-dropdown">
        <select
          ng-model="virtualDevice.selectedTemplate"
          ng-change="virtualDevice.selectedTemplate.navigate()"
          ng-options="templateOption.name for templateOption in virtualDevice.templateOptions track by templateOption.name">
        </select>
      </div>
    </div>

    <div class="device-container" style="width: {{ ::virtualDevice.config.width }}px" ng-if="virtualDevice.config.image">
      <div ng-repeat="(name, sensor) in ::virtualDevice.config.sensors">
        <tooltip ng-if="sensor.tooltip"
          options="sensor"
          label="name"
          value="virtualDevice.device.sensors[name].numericValue"
          update="virtualDevice.update(name, value)"
          device="virtualDevice.device">
        </tooltip>
        <div ng-if="sensor.widget" bind-html-compile="virtualDevice.getHtml(sensor.widget)"></div>
      </div>
      <img class="device-image" style="max-height: {{ ::virtualDevice.config.height }}px" src="{{ virtualDevice.config.image }}" />
    </div>
    <div class="no-image" ng-if="!virtualDevice.config.image">
      <h2>No image available</h2>
    </div>

    <div class="device-control-sliders" ng-if="virtualDevice.sensorsNotConfigured.length">
      <div class="header row">
        <div class="channel-name">Channel name</div>
        <div class="control">Control</div>
        <div class="value">Value</div>
      </div>
      <div class="row" ng-repeat="(name, sensor) in virtualDevice.device.sensors" ng-if="virtualDevice.sensorsNotConfigured.indexOf(name) > -1">
        <div class="channel-name">{{ name }}</div>
        <div class="control">
          <input type="range" min="0" max="100" ng-model="virtualDevice.sensors[name]" ng-change="virtualDevice.update(name, virtualDevice.sensors[name])" ng-disabled="!virtualDevice.device.ok">
        </div>
        <div class="value">
          {{ virtualDevice.sensors[name] }}
        </div>
      </div>
    </div>
  `,
  controllerAs: 'virtualDevice',
  bindings: {
    device: '=',
    templateOptions: '='
  },
  /* @ngInject */
  controller ($scope, DEVICES_CONFIG) {
    this.config = _.cloneDeep(DEVICES_CONFIG[this.device.template.name] || {})
    this.selectedTemplate = _.find(this.templateOptions, { name: this.device.template.name })

    delete this.device.sensors['_log']
    delete this.device.sensors['io']
    delete this.device.sensors['motion']
    delete this.device.sensors['environment']


    this.sensorsNotConfigured = _.pullAll(Object.keys(this.device.sensors), Object.keys(this.config.sensors || {}))
    this.sensors = this.sensorsNotConfigured.reduce((sensors, key) => {
      sensors[key] = 50
      return sensors
    }, {})

    $scope.$watch(() => this.device.sensors, (sensors) => {
      _.forEach(sensors, (sensor, name) => { this.sensors[name] = sensor.numericValue })
    }, true)

    // update sensor value
    this.update = _.debounce(this.device.update, 100)

    // get html for a widget element
    this.getHtml = (widget) => {
      const { name, position } = widget
      return `<${name} device="virtualDevice.device" options="sensor.widget.options" style="position: absolute; top: ${position.top}px; left: ${position.left}px"></${name}>`
    }
  }
}

module.exports = virtualDeviceComponent
