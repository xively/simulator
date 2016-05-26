require('./share.component.less')

const shareComponent = {
  template: `
    <p class="header">Share the link</p>
    <qrcode href="share.link"></qrcode>
    <div class="copy-link">
      <input type="text" ng-model="share.link" readonly onclick="this.select()">
      <span class="copy-button" data-label="copy" ng-click="share.copy()" ng-class="{copying: share.copying}">copy</span>
    </div>
    <div class="send-link">
      <input type="text" placeholder="Phone Number" ng-model="share.phone">
      <span class="send-button" data-label="text" ng-click="share.send()" ng-class="{sending: share.sending}">text</span>
    </div>
  `,
  bindings: {
    link: '<'
  },
  controllerAs: 'share',
  /* @ngInject */
  controller ($log, $rootScope, $timeout, $document, smsService, EVENTS) {
    // this.copying = false
    // copy () {
    //   const doc = $document[0]
    //   const node = doc.createElement('textarea')
    //   node.textContent = this.link
    //   doc.body.appendChild(node)
    //   const selection = doc.getSelection()
    //   selection.removeAllRanges()
    //   node.select()
    //   if (doc.execCommand('copy')) {
    //     this.copying = true
    //   }
    //   selection.removeAllRanges()
    //   doc.body.removeChild(node)
    //
    //   $timeout(() => {
    //     this.copying = false
    //   }, 500)
    // },
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
