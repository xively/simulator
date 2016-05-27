require('./share.component.less')

const shareComponent = {
  template: `
    <p class="header">Share the link</p>
    <qrcode href="share.link"></qrcode>
    <div class="copy-link">
      <input type="text" copy-link ng-model="share.link" readonly>
      <span class="copy-button" copy="share.link">copy</span>
    </div>
    <div class="send-link">
      <input type="text" placeholder="Phone Number" ng-model="share.phone">
      <span class="send-button" ng-click="share.send()">text</span>
    </div>
  `,
  bindings: {
    link: '<'
  },
  controllerAs: 'share',
  /* @ngInject */
  controller ($log, $rootScope, $timeout, $document, smsService, modalService, EVENTS) {
    this.send = () => {
      this.sending = true
      smsService.send(this.phone, this.link)
        .then((response) => {
          this.sending = false
          $log.debug('share#send:', response)
          if (response.status < 0 || response.status >= 400) {
            throw new Error(`Couldn't send SMS to phone number: ${this.phone}`)
          }
          $rootScope.$broadcast(EVENTS.NOTIFICATION, {
            type: 'success',
            text: `The SMS has been sent to: ${this.phone}`
          })
        })
        .catch((error) => {
          this.sending = false
          $rootScope.$broadcast(EVENTS.NOTIFICATION, {
            type: 'error',
            text: error && error.message
          })
          $log.error('share#send:', error)
        })
    }
  }
}

module.exports = shareComponent
