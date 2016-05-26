require('./tabs.component.less')

const tabsComponent = {
  template: `
    <div class="tabs-pagination">
      <div class="tabs-pagination-items">
        <div class="tabs-pagination-item"
             ng-repeat="tab in tabs.tabs"
             ng-click="tabs.selectTab(tab)"
             ng-class="{active: tab === tabs.selected}">
             {{ tab }}
        </div>
      </div>
    </div>
    <div class="tabs-content" ng-transclude>
    </div>
  `,
  transclude: true,
  controllerAs: 'tabs',
  /* @ngInject */
  controller ($log) {
    this.tabs = []
    this.addTab = (name) => {
      this.tabs.push(name)
      this.selected = this.tabs[0]
    }
    this.selectTab = (name) => {
      this.selected = name
    }
  }
}

module.exports = tabsComponent
