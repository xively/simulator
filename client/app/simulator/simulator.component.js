require('./simulator.component.less')

/* @ngInject */
const devicesComponent = {
  template: `
    <div>
      <modal name="rules">
        <rules></rules>
      </modal>

      <modal name="settings">
        <settings></settings>
      </modal>
    </div>
  `,
  controllerAs: 'simulator',
  /* @ngInject */
  controller ($q, devicesService, CONFIG) {
  }
}

module.exports = devicesComponent
