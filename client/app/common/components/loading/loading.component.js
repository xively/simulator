require('./loading.component.less')

/* @ngInject */
const loadingComponent = {
  template: `
    <div class="loading-bar">
      <div ng-show="loadingBar.loading">
        <div class="bar-1"></div>
        <div class="bar-2"></div>
      </div>
    </div>
  `,
  controllerAs: 'loadingBar',
  /* @ngInject */
  controller ($scope) {
    $scope.$on('simulator.loading', (event, args) => {
      this.loading = args.loading
    })
  }
}

module.exports = loadingComponent
