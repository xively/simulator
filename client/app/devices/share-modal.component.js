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
    </div>
  `,
  bindings: {
    toggle: '&',
    link: '<'
  },
  controllerAs: 'shareModal',
  /* @ngInject */
  controller ($location, $document, $timeout) {
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
      }
    }
  }
}

module.exports = shareModalComponent
