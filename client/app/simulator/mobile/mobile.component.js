require('./mobile.component.less')

const mobileComponent = {
  template: `
    <header-bar></header-bar>
    <notification></notification>
    <div class="scrollbar">
      <device-panel device="mobile.device"></device-panel>
    </div>
    <boldchat></boldchat>
  `,
  bindings: {
    device: '='
  },
  controllerAs: 'mobile',
  /* @ngInject */
  controller () {}
}

module.exports = mobileComponent
