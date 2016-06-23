const _ = require('lodash')

require('./tooltip.component.less')

const tooltipComponent = {
  template: `
    <div ng-show="tooltip.open">
      <div class="tooltip-box" style="{{ ::tooltip.getBoxStyle() }}">
        <div ng-if="tooltip.showInput()">
          <div class="tooltip-value">
            <span>{{ tooltip.newValue }}</span>
            <span>{{ ::tooltip.options.unit }}</span>
          </div>
          <input class="tooltip-range-input"
                 type="range"
                 min="{{ ::tooltip.options.min }}"
                 max="{{ ::tooltip.options.max }}"
                 value="{{ ::tooltip.options.min }}"
                 ng-model="tooltip.newValue" ng-change="tooltip.update({value: tooltip.newValue })"
                 ng-disabled="!tooltip.device.ok"/>
          <div class="tooltip-range">
            <span class="tooltip-range-min">{{ ::tooltip.options.min }}</span>
            <span class="tooltip-range-max">{{ ::tooltip.options.max }}</span>
          </div>
        </div>
        <div class="action-buttons">
          <button class="action-button"
                  ng-repeat="action in tooltip.options.actions"
                  ng-click="tooltip.sendUpdate(action)"
                  ng-disabled="!tooltip.device.ok">
                  {{ action.label }}
          </button>
        </div>
      </div>
      <svg class="tooltip-line"
        style="{{ tooltip.getLineStyle() }}"
        ng-attr-width="{{ ::tooltip.options.distance }}"
        height="3"
        viewPort="0 0 3 3">
        <line x1="0" y1="2" ng-attr-x2="{{ ::tooltip.options.distance }}" y2="2" />
      </svg>
    </div>

    <div ng-click="tooltip.toggle()" ng-class="{ active: tooltip.open }">
      <div class="tooltip-button"></div>
      <div class="tooltip-label" style="left: {{ ::tooltip.options.labelPosition.left }}px; top: {{ ::tooltip.options.labelPosition.top }}px;">
          {{ ::tooltip.label }}
      </div>
    </div>
  `,
  bindings: {
    options: '<',
    label: '<',
    value: '<',
    update: '&',
    device: '='
  },
  controllerAs: 'tooltip',
  /* @ngInject */
  controller ($element, $rootScope, $scope, socketService, segment, EVENTS) {
    Object.assign(this.options, {direction: 'top', distance: 100}, this.options.tooltip)

    $scope.$watch(() => {
      return this.value
    }, _.debounce((newValue) => {
      $scope.$applyAsync(() => {
        this.newValue = newValue

        if (this.open) {
          segment.track(EVENTS.TRACKING.SENSOR_VALUE_CHANGED_SLIDER, {
            deviceName: this.device.name,
            label: this.label,
            value: this.value
          })
        }
      })
    }, 100))

    $element.css({
      top: `${this.options.position.top}px`,
      left: `${this.options.position.left}px`
    })

    this.open = false
    this.toggle = (value) => {
      this.open = !this.open
    }

    this.getBoxStyle = () => {
      const {direction, distance} = this.options
      const sign = direction === 'right' || direction === 'bottom' ? '' : '-'
      const position = direction === 'left' || direction === 'right' ? `${sign}${distance}px, 0` : `0, ${sign}${distance}px`

      return `
        -webkit-transform: translate(${position});
        -moz-transform: translate(${position});
        transform: translate(${position});
      `
    }

    this.getLineStyle = () => {
      const {direction} = this.options
      const rotation = {
        right: 0,
        bottom: 90,
        left: 180,
        top: 270
      }[direction]
      return `
        -webkit-transform: rotate(${rotation}deg);
        -moz-transform: rotate(${rotation}deg);
        transform: rotate(${rotation}deg);
        -webkit-transform-origin: left;
        -moz-transform-origin: left;
        transform-origin: left;
      `
    }

    this.showInput = () => {
      return (!this.options.actions || (this.options.actions && this.options.input)) &&
          _.isNumber(this.options.min) &&
          _.isNumber(this.options.max)
    }

    this.sendUpdate = ({name, value, device = {}, socket = false, notification}) => {
      const obj = {value}
      if (name) {
        obj.name = name
      }

      if (socket) {
        socketService.sendMessage(this.device, name, value)
      } else {
        this.update(obj)
      }
      _.merge(this.device, device)

      if (notification) {
        $rootScope.$broadcast(EVENTS.NOTIFICATION, notification)
      }
    }
  }
}

module.exports = tooltipComponent
