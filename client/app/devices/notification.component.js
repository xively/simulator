const _ = require('lodash')

require('./notification.component.less')

const notificationComponent = {
  template: `
    <div class="notification-item" ng-repeat="item in notification.items" ng-class="item.type">
      <p>{{ item.text }}</p>
      <div class="close" ng-click="item.remove()">&#x2715;</div>
    </div>
  `,
  controllerAs: 'notification',
  /* @ngInject */
  controller ($log, $scope, $timeout, EVENTS) {
    this.items = []
    $scope.$on(EVENTS.NOTIFICATION, (event, item) => {
      if (item) {
        // remove error notifications on success
        if (item.type === 'success') {
          _.remove(this.items, { type: 'error' })
        }

        this.items.push(item)
        item.remove = () => _.remove(this.items, item)

        if (!item.sticky) {
          $timeout(item.remove, item.timeout || 20000)
        }
      }
    })
  }
}

module.exports = notificationComponent
