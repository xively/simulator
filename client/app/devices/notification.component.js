const _ = require('lodash')

require('./notification.component.less')

const notificationComponent = {
  template: `
    <div class="notification-item" ng-repeat="item in notification.items" ng-class="item.type">
      {{ item.text }}
      <div class="close" ng-click="item.remove()">&#x2715;</div>
    </div>
  `,
  controllerAs: 'notification',
  /* @ngInject */
  controller ($log, $scope, $timeout, EVENTS) {
    this.items = []
    $scope.$on(EVENTS.NOTIFICATION, (event, item) => {
      if (item) {
        this.items.push(item)
        item.remove = () => _.remove(this.items, item)

        $timeout(item.remove, item.timeout || 3000)
      }
    })
  }
}

module.exports = notificationComponent
