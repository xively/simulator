const _ = require('lodash')
require('./settings.component.less')

/* @ngInject */
const settingsComponent = {
  template: `
    <tabs>
      <tab name="Credentials">
        <credentials></credentials>
      </tab>
      <tab name="Device settings">
        <device-config></device-config>
      </tab>
    </tabs>
  `,
  controllerAs: 'settings',
  /* @ngInject */
  controller ($log, $document, $window, $q, settingsService, CONFIG, DEVICES_CONFIG) {
    let savedDeviceConfig = _.cloneDeep(DEVICES_CONFIG)
    this.deviceConfig = JSON.stringify(DEVICES_CONFIG, null, 2)

    this.updateConfig = () => {
      if (!this.configError) {
        savedDeviceConfig = JSON.parse(this.deviceConfig)
        return settingsService.updateDeviceConfig(this.deviceConfig)
          .then((deviceConfig) => {
            this.deviceConfig = JSON.stringify(deviceConfig, null, 2)
          })
      }
      return $q.reject()
    }

    this.applyConfig = () => {
      this.updateConfig()
        .then(() => $window.location.reload())
    }

    this.undoConfig = () => {
      this.deviceConfig = JSON.stringify(savedDeviceConfig, null, 2)
    }

    this.resetConfig = () => {
      if ($window.confirm('Do you really want to reset the device config?')) {
        settingsService.getOriginalDeviceConfig().then((deviceConfig) => {
          this.deviceConfig = JSON.stringify(deviceConfig, null, 2)
        })
      }
    }

    this.togglePanel = (panelName) => {
      this[panelName] = !this[panelName]
    }

    this.deviceConfigGuideOpen = false
    this.deviceConfigGuide = {
      'device template name': {
        image: 'image url [String]',
        width: 'container width [Number]',
        defaultSensor: 'default selected sensor to show on chart [String]',
        sensors: {
          'sensor name': {
            min: 'minimum sensor value [Number]',
            max: 'maximum sensor value [Number]',
            default: 'default sensor value [Number]',
            wiggle: 'simulation wiggle [Boolean]',
            unit: 'sensor measurement unit [String]',
            tooltip: {
              position: {
                top: 'distance of the yellow dot on the device image from top of device image in pixels [Number]',
                left: 'distance of the yellow dot on the device image from left side of device image in pixels [Number]'
              },
              labelPosition: {
                top: 'distance of the top of the label box from the yellow dot in pixels [Number]',
                left: 'distance of the left side of the label box from the yellow dot in pixels [Number]'
              },
              distance: 'distance of the label box and the yellow dot in pixels [Number]',
              direction: 'orientation of the tooltip [top | right | bottom | left]'
            }
          }
        }
      }
    }

    this.newDevicePanelOpen = false
    this.addNewDevice = (deviceForm) => {
      const config = JSON.parse(this.deviceConfig)

      config[deviceForm.tempalteName] = {
        image: deviceForm.imageUrl,
        width: parseInt(deviceForm.imageWidth, 10),
        sensors: deviceForm.sensors.reduce((sensors, currentSensor, idx) => {
          sensors[currentSensor.text] = {
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
        }, {})
      }

      this.newDevicePanelOpen = false
      this.deviceConfig = JSON.stringify(config, undefined, 2)
    }
  }
}

module.exports = settingsComponent
