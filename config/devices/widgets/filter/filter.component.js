require('./filter.component.less')

/* @ngInject */
const navComponent = {
  template: `
    <div class="filter">
      <p>The filter should be replaced in:</p>
      <div class="filter-status">
        <svg viewBox="-10 -10 220 220">
          <path class="progress-indicator" d="M 0,100 A 100,100 0 1,1 0,100.01" ng-attr-stroke-dashoffset="{{ filter.dashOffset }}" stroke-dasharray="630"></path>
        </svg>
        <div class="filter-status-days">
          <span>{{ filter.lifeLeft }}</span>
          <div class="label">{{ filter.measure }}</div>
        </div>
      </div>
    </div>
  `,
  replace: true,
  bindings: {
    device: '='
  },
  controllerAs: 'filter',
  /* @ngInject */
  controller ($scope) {
    this.dashOffset = 0
    const dasharray = 630
    const max = 1000
    this.lifeLeft = Math.round(max / 24)

    $scope.$watch(() => {
      return this.device.sensors.filter
    }, (filter = {}) => {
      let actual = parseInt(filter.numericValue, 10)
      if (Number.isNaN(actual)) {
        actual = 1000
      }
      this.dashOffset = Math.min(
        dasharray,
        (max - (actual / max) * max) * (dasharray / max)
      )
      if (actual > 48) {
        this.lifeLeft = Math.round(actual / 24)
        this.measure = 'days'
      } else {
        this.lifeLeft = actual
        this.measure = 'hours'
      }
    })
  }
}

module.exports = navComponent
