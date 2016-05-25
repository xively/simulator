require('./settings.component.less')

/* @ngInject */
const settingsComponent = {
  template: `
    <tabs>
      <tab name="Credentials">
        <credentials></credentials>
      </tab>
      <tab name="Device settings">
        <device-config></device-config>
      </tab>
    </tabs>
  `,
  controllerAs: 'settings',
  /* @ngInject */
  controller () {}
}

module.exports = settingsComponent
