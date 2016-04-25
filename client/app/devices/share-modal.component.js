require('./share-modal.component.less')

const shareModalComponent = {
  template: `
    <div class="share-modal content">
      <div class="close" ng-click="shareModal.toggle()">&#x2715;</div>
      <p class="header">Share the link</p>
      <qrcode href="shareModal.share.link"></qrcode>
      <div class="copy-link">
        <input type="text" ng-model="shareModal.share.link" readonly onclick="this.select()">
        <span class="copy-button" data-label="copy" ng-click="shareModal.share.copy()" ng-class="{copying: shareModal.share.copying}">copy</span>
      </div>
      <div class="send-link">
        <input type="text" placeholder="Phone Number" ng-model="shareModal.share.phone">
        <span class="send-button" data-label="text" ng-click="shareModal.share.send()" ng-class="{sending: shareModal.share.sending}">text</span>
      </div>
    </div>
  `,
  bindings: {
    toggle: '&',
    link: '<'
  },
  controllerAs: 'shareModal',
  /* @ngInject */
  controller ($log, $rootScope, $location, $document, $timeout, smsService, EVENTS) {
    this.modal = false
    this.toggleModal = () => {
      this.modal = !this.modal
    }

    this.share = {
      link: this.link,
      copying: false,
      copy () {
        const doc = $document[0]
        const node = doc.createElement('textarea')
        node.textContent = this.link
        doc.body.appendChild(node)
        const selection = doc.getSelection()
        selection.removeAllRanges()
        node.select()
        if (doc.execCommand('copy')) {
          this.copying = true
        }
        selection.removeAllRanges()
        doc.body.removeChild(node)

        $timeout(() => {
          this.copying = false
        }, 500)
      },
      phone: '',
      sending: false,
      send () {
        this.sending = true
        smsService.send(this.phone, this.link)
          .then((response) => {
            this.sending = false
            $log.debug('shareModal#send:', response)
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
            $log.error('shareModal#send:', error)
          })
      }
    }
  }
}

module.exports = shareModalComponent
