const _ = require('lodash')

require('./devices.route.less')

const connectedIcon = require('./images/connected.svg')
const notConnectedIcon = require('./images/not-connected.svg')

/* @ngInject */
function devicesRoute ($stateProvider) {
  $stateProvider.state('devices', {
    url: '/devices',
    template: '<ui-view/>',
    redirectTo: 'devices.list'
  })

  $stateProvider.state('devices.list', {
    url: '',
    template: `
      <div class="devices container">
        <h1>Devices</h1>
        <div class="content">
          <table>
            <thead>
              <tr>
                <th ng-repeat="header in ::devices.tableHeaders"
                    ng-click="devices.changeOrder(header.field)"
                    ng-class="{active: devices.orderBy === header.field, reverse: devices.reverseOrder}">
                  {{ header.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr ng-repeat="device in devices.devices | orderBy:devices.orderBy:devices.reverseOrder track by device.id"
                  ui-sref="devices.device({ id: device.id })">
                <td>
                  <span>{{ device.name || 'N/A' }}</span>
                  <br>
                  <span class="secondary">{{ device.serialNumber }}</span>
                </td>
                <td class="capitalize">{{ device.template.name }}</td>
                <td>{{ device.provisioningState }}</td>
                <td>
                  <span ng-if="device.connected">${connectedIcon}</span>
                  <span ng-if="!device.connected">${notConnectedIcon}</span>
                </td>
                <td>{{ device.location || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    `,
    controllerAs: 'devices',
    /* @ngInject */
    controller ($q, devicesService, CONFIG) {
      this.devices = []
      $q.all([
        devicesService.getDevices(),
        devicesService.getDeviceTemplates()
      ])
        .then(([devices, templates]) => {
          devices = _.toArray(devices)
          _.forEach(devices, (device) => {
            device.template = templates[device.deviceTemplateId]
          })
          _.assign(this.devices, devices)
        })

      this.tableHeaders = [
        { title: 'Name', field: 'name' },
        { title: 'Type', field: 'template.name' },
        { title: 'Provisioning Status', field: 'provisioningState' },
        { title: 'Connection Status', field: 'connected' },
        { title: 'Location', field: 'location' }
      ]

      this.orderBy = this.tableHeaders[0].field
      this.reverseOrder = false
      this.changeOrder = (field) => {
        if (this.orderBy === field) {
          this.reverseOrder = !this.reverseOrder
        } else {
          this.orderBy = field
        }
      }
    }
  })
}

module.exports = devicesRoute
