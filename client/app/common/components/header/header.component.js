require('./header.component.less')
const xivelyLogo = require('./images/xively-logo.png')

/* @ngInject */
const headerComponent = {
  template: `
    <nav class="header-bar">
      <div class="logo">
        <img src="${xivelyLogo}"></img>
        <div>Product Simulator</div>
      </div>
    </nav>
  `
}

module.exports = headerComponent
