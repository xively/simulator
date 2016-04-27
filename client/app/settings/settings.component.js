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
      </div>
    </section>
  `,
  controllerAs: 'settings',
  /* @ngInject */
  controller ($document, CONFIG) {
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
  }
}

module.exports = settingsComponent
