require('./credentials.component.less')

const _ = require('lodash')

const credentialsComponent = {
  template: `
    <div class="credentials">
      <div class="credential" ng-repeat="(name, value) in credentials.config">
        <h2 class="name">
          <span>{{ name }}</span>
          <span ng-if="::value.link">
            &nbsp;|&nbsp;
            <a class="link" href="{{ ::value.link.url }}" target="_blank">{{ ::value.link.text }}</a>
          </span>
        </h2>
        <ul class="credentials-list">
          <li class="form-row" ng-repeat="(subname, object) in value.items">
            <label>{{ ::subname }}</label>
            <span ng-if="!object.isPassword">
              <input type="text"
                placeholder="Not available"
                ng-model="object.text"
                ng-click="credentials.select($event)"
                ng-readonly="{{ !object.editable }}"/>
              <span ng-show="object.text" copy="object.text">copy</span>
            </span>
            <span ng-if="object.isPassword && object.text">
              <input class="pointer"
                type="text"
                value="Hidden. Click here to view."
                ng-click="object.isPassword = false"
                readonly/>
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="buttons">
      <button class="button pull-right"
        ng-disabled="credentials.saveIsDisabled()"
        ng-click="credentials.saveSalesforceConfig()">
        Update Salesforce credentials
      </button>
    </div>
  `,
  controllerAs: 'credentials',
  /* @ngInject */
  controller ($scope, applicationConfigService, CONFIG) {
    this.config = {
      'Xively Account': {
        link: {
          text: 'open the Xively platform',
          // FIXME workaround
          url: `https://${CONFIG.account.idmHost.replace('id.', 'app.')}/login?accountId=${CONFIG.account.accountId}`
        },
        items: {
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
      },
      'Salesforce Settings': {
        items: {
          Username: {
            text: null,
            editable: true
          },
          Password: {
            isPassword: true,
            text: null,
            editable: true
          },
          Token: {
            isPassword: true,
            text: null,
            editable: true
          }
        }
      }
    }

    applicationConfigService.get()
      .then((config = {}) => {
        _.merge(this.config, {
          'Salesforce Settings': {
            items: {
              Username: { text: config.salesforceUsername },
              Password: { text: config.salesforcePassword },
              Token: { text: config.salesforceToken }
            }
          }
        })
      })

    this.saveIsDisabled = () => {
      const { Username, Password, Token } = this.config['Salesforce Settings'].items
      return !(Username.text && Password.text && Token.text)
    }

    this.saveSalesforceConfig = () => {
      const { Username, Password, Token } = this.config['Salesforce Settings'].items
      if (!this.saveIsDisabled()) {
        applicationConfigService.update({
          salesforceUsername: Username.text,
          salesforcePassword: Password.text,
          salesforceToken: Token.text
        })
      }
    }

    this.select = (event) => {
      const element = event.currentTarget
      element.select()
    }
  }
}

module.exports = credentialsComponent
