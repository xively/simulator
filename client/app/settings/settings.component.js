require('./settings.component.less')

const _ = require('lodash')

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
              <label>{{ ::subname }}:</label>
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
            <button type="button" class="pull-right button primary" ng-click="settings.toggleDeviceConfigGuide()">
              {{ settings.deviceConfigGuideOpen ? 'Close' : 'Show' }} guide
            </button>
          </h2>

          <div class="config-guide" ng-show="settings.deviceConfigGuideOpen">
            <pre>{{ settings.deviceConfigGuide | json }}</pre>
          </div>

          <textarea ng-model="settings.deviceConfig" ng-change="settings.formatConfig()" ng-model-options="{ debounce: 1000 }"
            placeholder="Press show guide button for help"></textarea>
          <button type="button" class="button primary" ng-click="settings.updateConfig()" ng-disabled="settings.configError">Save</button>
          <button type="button" class="button secondary" ng-click="settings.applyConfig()" ng-disabled="settings.configError">Apply</button>
          <span class="pull-right">
            <small>Applying the changes will result in page reload</small>
          </span>
        </div>
      </div>
    </section>
  `,
  controllerAs: 'settings',
  /* @ngInject */
  controller ($document, $window, settingsService, CONFIG, DEVICES_CONFIG) {
    settingsService.getDeviceConfig()
      .then((res) => {
        if (!_.isEmpty(res.data.deviceConfig)) {
          this.deviceConfig = JSON.stringify(res.data.deviceConfig, undefined, 2)
        }
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
        this.deviceConfig = JSON.stringify(parsed, undefined, 2)
      } catch (ex) {
        this.configError = true
      }
    }

    this.updateConfig = () => {
      this.formatConfig()

      if (!this.configError) {
        return settingsService.updateDeviceConfig(this.deviceConfig)
          .then((res) => {
            this.deviceConfig = JSON.stringify(res.data.deviceConfig, undefined, 2)
          })
      }
    }

    this.applyConfig = () => {
      this.updateConfig()
        .then(() => $window.location.reload())
    }

    this.toggleDeviceConfigGuide = () => {
      this.deviceConfigGuideOpen = !this.deviceConfigGuideOpen
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
                top: 'distance of the label box on the device image from top of device image in pixels [Number]',
                left: 'distance of the label box on the device image from left side of device image in pixels [Number]'
              },
              distance: 'distance of the label box and the yellow dot in pixels [Number]',
              direction: 'orientation of the tooltip [top | right | bottom | left]'
            }
          }
        }
      }
    }
  }
}

module.exports = settingsComponent
