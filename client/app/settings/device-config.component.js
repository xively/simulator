const _ = require('lodash')

require('./device-config.component.less')

const deviceConfig = {
  template: `
    <div class="selector">
      <select
        ng-model="deviceConfig.options.selectedOption"
        ng-change="deviceConfig.options.selectedOption.select()"
        ng-options="template.name for template in deviceConfig.options.availableOptions track by template.id">
      </select>
      <div class="mode" ng-click="deviceConfig.showEditor = !deviceConfig.showEditor">
        {{ deviceConfig.showEditor ? 'Simple' : 'Advanced' }}
      </div>
    </div>
    <div class="form" ng-show="!deviceConfig.showEditor">
      <device-form
        image="deviceConfig.image"
        width="deviceConfig.width"
        sensors="deviceConfig.sensors"
        update="deviceConfig.update(deviceForm)">
      </device-form>
      <image-upload image="deviceConfig.image"></image-upload>
    </div>

    <editor ng-show="deviceConfig.showEditor" json="deviceConfig.json" error="deviceConfig.error"></editor>

    <div class="buttons">
      <button type="button" class="button delete-outline" ng-click="deviceConfig.undoConfig()">Undo</button>
      <button type="button" class="button primary" ng-click="deviceConfig.saveConfig()" ng-disabled="deviceConfig.error">Save</button>
      <button type="button" class="button secondary" ng-click="deviceConfig.saveAndCloseConfig()" ng-disabled="deviceConfig.error">Save & Close</button>
      <button type="button" class="button delete pull-right" ng-click="deviceConfig.resetConfig()">Reset to default</button>
    </div>
  `,
  controllerAs: 'deviceConfig',
  /* @ngInject */
  controller ($scope, $window, devicesService, settingsService, DEVICES_CONFIG) {
    const self = this
    this.error = false

    this.config = {}
    $scope.$watch(() => this.config, (config = {}) => {
      this.json = JSON.stringify(config, null, 2)
    }, true)

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

    this.update = (deviceForm) => {
      // apply image and width
      _.merge(this.config, {
        image: deviceForm.image,
        width: _.clamp(parseInt(deviceForm.width || 800, 10), 0, 1200)
      })

      if (deviceForm.sensors) {
        const sensors = deviceForm.sensors.map((sensor) => sensor.text)
        // remove sensors
        this.config.sensors = _.pick(this.config.sensors, sensors)
        // add new sensors
        this.config.sensors = _.defaults(this.config.sensors, sensors.reduce((sensors, sensor, idx) => {
          sensors[sensor] = {
            min: 0,
            max: 100,
            wiggle: false,
            unit: 'm',
            tooltip: {
              position: {
                top: 100,
                left: idx * 50
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
      }
    }

    this.undoConfig = () => {
      this.setNewConfig(this.savedConfig)
    }
    this.saveConfig = () => {
      settingsService.updateDeviceConfig(this.options.selectedOption.name, this.json).then((config) => {
        this.setNewConfig(config)
        this.savedConfig = _.cloneDeep(config)
      })
    }
    this.saveAndCloseConfig = () => {
      settingsService.updateDeviceConfig(this.options.selectedOption.name, this.json).then(() => {
        $window.location.reload(true)
      })
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
      this.width = this.config.width
      this.sensors = Object.keys(this.config.sensors || []).map((text) => ({ text }))
    }
  }
}

module.exports = deviceConfig
