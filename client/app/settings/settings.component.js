require('./settings.component.less')

/* @ngInject */
const settingsComponent = {
  template: `
    <section class="settings container">
      <header>
        <h1 class="title">Settings</h1>
      </header>
      <div class="content">
        <div class="group" ng-repeat="(name, value) in ::settings.config">
          <h2 class="name">
            <span>{{ name }}</span>
            <span ng-if="::value.link">
              &nbsp;|&nbsp;
              <a class="link" href="{{ ::value.link.url }}" target="_blank">{{ ::value.link.text }}</a>
            </span>
          </h2>
          <ul class="settings-list">
            <li class="form-row" ng-repeat="(subname, object) in ::value.items">
              <label>{{ ::subname }}</label>
              <span ng-if="!object.isPassword">
                <input type="text"
                       value="{{object.text}}"
                       ng-click="settings.select($event)"
                       readonly/>
              </span>
              <span ng-if="object.isPassword">
                <input type="text"
                       value="Hidden. Click here to view. &#x1f441;"
                       ng-click="object.isPassword = false"
                       readonly/>
              </span>
            </li>
          </ul>
        </div>

        <div class="group">
          <h2 class="name">
            Device config
            <small class="error" ng-if="settings.configError">Config must be a valid JSON.</small>

            <div class="pull-right">
              <button type="button" class="button primary" ng-click="settings.togglePanel('deviceConfigGuideOpen')">
                {{ settings.deviceConfigGuideOpen ? 'Close' : 'Show' }} guide
              </button>
              <button class="button secondary" ng-click="settings.togglePanel('newDevicePanelOpen')">
                Add new device
              </button>
            </div>
          </h2>

          <div class="new-device" ng-show="settings.newDevicePanelOpen">
            <div class="group">
              <h2 class="name">Add new device template</h2>
              <form>
                <div class="form-row">
                  <label>Template name</label>
                  <input type="text" class="input-field" ng-model="settings.newDevice.tempalteName"/>
                </div>
                <div class="form-row">
                  <label>Image url</label>
                  <input type="text" class="input-field" ng-model="settings.newDevice.imageUrl"/>
                </div>
                <div class="form-row">
                  <label>Image width</label>
                  <input type="text" class="input-field" ng-model="settings.newDevice.imageWidth"/>
                </div>
                <div class="form-row">
                  <label>Sensors</label>
                  <tags-input ng-model="settings.newDevice.sensors"
                    min-length="1"
                    placeholder="Add sensor"
                    replace-spaces-with-dashes="false"
                    ></tags-input>
                </div>
                <div class="form-row">
                  <button class="button primary" ng-click="settings.addNewDevice()">Add</button>
                </div>
              </form>
            </div>
          </div>

          <div class="config-guide" ng-show="settings.deviceConfigGuideOpen">
            <pre>{{ settings.deviceConfigGuide | json }}</pre>
          </div>

          <div ui-ace="settings.aceOptions" ng-model="settings.deviceConfig"></div>

          <div class="buttons">
            <button type="button" class="button delete-outline" ng-click="settings.undoConfig()">Undo</button>
            <button type="button" class="button primary" ng-click="settings.updateConfig()" ng-disabled="settings.configError">Save</button>
            <button type="button" class="button secondary" ng-click="settings.applyConfig()" ng-disabled="settings.configError">Apply</button>
            <button type="button" class="button delete pull-right" ng-click="settings.resetConfig()">Reset</button>
          </div>
          <small>Applying the changes will result in page reload</small>
        </div>
      </div>
    </section>
  `,
  controllerAs: 'settings',
  /* @ngInject */
  controller ($document, $window, $q, settingsService, CONFIG, DEVICES_CONFIG) {
    let savedDeviceConfig = {}
    settingsService.getDeviceConfig()
      .then((deviceConfig) => {
        savedDeviceConfig = deviceConfig
        this.deviceConfig = JSON.stringify(deviceConfig, null, 2)
      })

    const account = {
      ['Account ID']: {
        text: CONFIG.account.accountId
      },
      Username: {
        text: CONFIG.account.emailAddress
      },
      Password: {
        isPassword: true,
        text: CONFIG.account.password
      }
    }

    const salesforce = {
      Username: {
        text: CONFIG.salesforce.user || 'Not available'
      },
      Password: {
        isPassword: true,
        text: CONFIG.salesforce.pass || 'Not available'
      },
      Secret: {
        isPassword: true,
        text: CONFIG.salesforce.token || 'Not available'
      }
    }

    this.config = {
      'Xively Account': {
        link: {
          text: 'open the Xively platform',
          // FIXME workaround
          url: `https://${CONFIG.account.idmHost.replace('id.', 'app.')}/login?accountId=${CONFIG.account.accountId}`
        },
        items: account
      },
      'Salesforce Settings': {
        items: salesforce
      }
    }

    this.select = (event) => {
      const element = event.currentTarget
      element.select()
      $document[0].execCommand('copy')
    }

    this.formatConfig = () => {
      this.configError = false

      if (!this.deviceConfig.length) {
        return
      }

      let parsed
      try {
        parsed = JSON.parse(this.deviceConfig)
        this.deviceConfig = JSON.stringify(parsed, null, 2)
      } catch (ex) {
        this.configError = true
      }
    }

    this.aceOptions = {
      useWrapMode: true,
      showGutter: true,
      mode: 'json',
      onChange: this.formatConfig.bind(this)
    }

    this.updateConfig = () => {
      this.formatConfig()

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
    this.addNewDevice = () => {
      const config = JSON.parse(this.deviceConfig)

      config[this.newDevice.tempalteName] = {
        image: this.newDevice.imageUrl,
        width: this.newDevice.imageWidth,
        sensors: this.newDevice.sensors.reduce((sensors, currentSensor, idx) => {
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
      this.newDevice = {}
    }
  }
}

module.exports = settingsComponent
