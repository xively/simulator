const QRCode = require('qrcodejs2')

require('./qrcode.component.less')

const qrcodeComponent = {
  bindings: {
    href: '<'
  },
  /* @ngInject */
  controller ($scope, $element) {
    const qrcode = new QRCode($element[0], this.href)

    $scope.$watch(() => {
      return this.href
    }, (newValue) => {
      qrcode.clear()
      qrcode.makeCode(newValue)
    })
  }
}

module.exports = qrcodeComponent
