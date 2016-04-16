require('./hvac-display.component.less')

/* @ngInject */
const hvacDisplayComponent = {
  template: `
    <div class="display" ng-class="{ malfunction: !display.device.ok }">
    </div>
  `,
  bindings: {
    device: '='
  },
  controllerAs: 'display'
}

module.exports = hvacDisplayComponent
