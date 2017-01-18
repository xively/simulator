require('./filter.component.less')

/* @ngInject */
const filterComponent = {
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
  controller ($scope, $interval) {
    const dasharray = 630
    this.dashOffset = dasharray
    const max = 1000
    this.value = 0
    this.lifeLeft = Math.round(this.value / 24)

    const setFilterValue = (value) => {
      this.value = value
      this.dashOffset = Math.min(
        dasharray,
        (max - (value / max) * max) * (dasharray / max)
      )
      if (value > 48) {
        this.lifeLeft = Math.round(value / 24)
        this.measure = 'days'
      } else {
        this.lifeLeft = value
        this.measure = 'hours'
      }
    }

    let interval
    $scope.$watch(() => {
      return this.device.sensors.filter
    }, (filter = {}) => {
      $interval.cancel(interval)

      let actual = parseInt(filter.numericValue, 10)
      if (Number.isNaN(actual)) {
        return
      }

      if (this.value > actual) {
        let step = () => Math.min(50, this.value - actual)
        setFilterValue(this.value - step())
        interval = $interval(() => {
          if (this.value <= actual) {
            return $interval.cancel(interval)
          }
          setFilterValue(this.value - step())
        }, 100)
      } else {
        setFilterValue(actual)
      }
    })
  }
}

module.exports = filterComponent
