require('./tab.component.less')

const tabComponent = {
  template: `
    <div class="content"
         ng-show="tab.tabs.selected === tab.name"
         ng-transclude>
    </div>
  `,
  require: {
    tabs: '^tabs'
  },
  transclude: true,
  controllerAs: 'tab',
  bindings: {
    name: '@'
  },
  /* @ngInject */
  controller ($log) {
    this.$onInit = () => {
      this.tabs.addTab(this.name)
    }
  }
}

module.exports = tabComponent
