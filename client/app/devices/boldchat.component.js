require('./boldchat.component.less')

const commentingIcon = require('./images/commenting.svg')

const boldchatComponent = {
  template: `
    <style ng-if="boldchat.demoView">
      #bc-chat-container {
        position: absolute !important;
        top: 285px !important;
        right: auto !important;
        bottom: auto !important;
        left: 65px !important;
      }
    </style>
    <div class="boldchat-button" ng-click="boldchat.open()">
      <p>${commentingIcon} Contact a Representative</p>
    </div>
  `,
  controllerAs: 'boldchat',
  /* @ngInject */
  controller ($window, $location) {
    this.demoView = $location.path().includes('/demo')

    const bdid = '457830310750908782'
    const _bcvma = [
      ['setAccountID', '461159850398350203'],
      ['setParameter', 'WebsiteID', '457763915474596414'],
      ['addStatic', { type: 'chat', bdid }]
    ]
    $window._bcvma = _bcvma
    $window.bcLoaded = true
    $window.pageViewer && $window.pageViewer.load()

    this.open = () => {
      $window._bcvmw.chatWindow({
        bdid,
        element: 'boldchat',
        embed: true,
        height: 530,
        html: false,
        type: 'chat',
        video: false,
        width: 350
      })
    }
  }
}

module.exports = boldchatComponent
