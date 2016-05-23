const _ = require('lodash')

require('./device-config.component.less')

const editorIcon = require('./images/editor.svg')
const formIcon = require('./images/form.svg')

const deviceConfig = {
  template: `
    <div class="section">
      <image-upload image="deviceConfig.image"></image-upload>
      <div class="selector">
        <div class="mode">
          <div ng-class="{active: deviceConfig.advancedMode}"
               ng-click="deviceConfig.advancedMode = true">
            ${editorIcon}
          </div>
          <div ng-class="{active: !deviceConfig.advancedMode}"
               ng-click="deviceConfig.advancedMode = false">
            ${formIcon}
          </div>
        </div>
        <select
          ng-model="deviceConfig.options.selectedOption"
          ng-change="deviceConfig.options.selectedOption.select()"
          ng-options="template.name for template in deviceConfig.options.availableOptions track by template.id">
        </select>
      </div>
    </div>

    <div class="section">
      <div class="form" ng-show="!deviceConfig.advancedMode">
        <device-form
          image="deviceConfig.image"
          sensors="deviceConfig.sensors"
          update="deviceConfig.update(deviceForm)">
        </device-form>
      </div>
      <editor ng-show="deviceConfig.advancedMode"
              json="deviceConfig.json"
              error="deviceConfig.error"
              update="deviceConfig.setNewConfig(config)"></editor>
    </div>

    <div class="section buttons">
      <button type="button" class="button reset" ng-click="deviceConfig.resetConfig()">Reset to default</button>
      <button type="button" class="button ok pull-right" ng-click="deviceConfig.applyConfig()" ng-disabled="deviceConfig.error">OK</button>
    </div>
  `,
  controllerAs: 'deviceConfig',
  /* @ngInject */
  controller ($scope, $window, devicesService, settingsService, DEVICES_CONFIG) {
    const self = this
    this.error = false

    devicesService.getDeviceTemplates().then((templates) => {
      const availableOptions = _.map((templates), (template, id) => ({
        id,
        name: template.name,
        select () {
          self.setNewConfig(DEVICES_CONFIG[this.name] || {})
          self.savedConfig = _.cloneDeep(self.config)
        }
      }))

      const selectedOption = availableOptions[0]

      this.options = {
        availableOptions,
        selectedOption
      }
    })

    this.config = {}
    $scope.$watch(() => this.config, (config = {}) => {
      this.json = JSON.stringify(config, null, 2)
      if (this.options && this.options.selectedOption) {
        settingsService.updateDeviceConfig(this.options.selectedOption.name, this.json)
      }
    }, true)

    this.update = (deviceForm) => {
      // apply image and width
      this.config.image = deviceForm.image
      this.config.width = this.config.width || 800

      if (deviceForm.sensors) {
        const sensors = deviceForm.sensors.map((sensor) => sensor.text)
        // remove sensors
        this.config.sensors = _.pick(this.config.sensors, sensors)
        // add new sensors
        this.config.sensors = _.defaults(this.config.sensors, deviceForm.sensors.reduce((sensors, sensor, idx) => {
          sensors[sensor.text] = {
            min: sensor.min || 0,
            max: sensor.max || 100,
            wiggle: false,
            unit: sensor.unit,
            tooltip: {
              position: {
                top: sensor.top || 100,
                left: sensor.left || idx * 50
              },
              labelPosition: {
                top: 0,
                left: 20
              },
              distance: 100,
              direction: 'bottom'
            }
          }
          return sensors
        }, {}))
        // modify existing sensors
        _.merge(this.config.sensors, deviceForm.sensors.reduce((sensors, sensor) => {
          const tooltipOrWidget = this.config.sensors[sensor.text].widget ? 'widget' : 'tooltip'
          sensors[sensor.text] = {
            min: sensor.min,
            max: sensor.max,
            unit: sensor.unit,
            [tooltipOrWidget]: {
              position: {
                top: sensor.top,
                left: sensor.left
              }
            }
          }
          return sensors
        }, {}))
      }
    }

    this.applyConfig = () => {
      $window.location.reload(true)
    }
    this.resetConfig = () => {
      if ($window.confirm('Do you really want to reset the device config?')) {
        settingsService.getOriginalDeviceConfig(this.options.selectedOption.name).then((config) => {
          this.setNewConfig(config)
        })
      }
    }

    this.setNewConfig = (config) => {
      Object.keys(this.config).forEach((key) => delete this.config[key])
      _.assign(this.config, config)

      this.image = this.config.image
      this.sensors = _.map(this.config.sensors || [], (sensor, text) => ({
        text,
        min: sensor.min,
        max: sensor.max,
        unit: sensor.unit,
        top: ((sensor.tooltip || sensor.widget || {}).position || {}).top,
        left: ((sensor.tooltip || sensor.widget || {}).position || {}).left
      }))
    }
  }
}

module.exports = deviceConfig
