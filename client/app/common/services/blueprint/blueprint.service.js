const _ = require('lodash')

/* @ngInject */
function blueprintFactory ($log, $http, locationService, CONFIG) {
  return {
    /**
     * GET resource
     * @param  {String} resource
     * @param  {Object?} params
     * @return {Promise} HTTP response
     */
    getV1 (resource, params = {}) {
      _.assign(params, { accountId: CONFIG.account.accountId })
      return $http({
        method: 'GET',
        url: `https://${CONFIG.account.blueprintHost}/api/v1/${resource}`,
        params,
        headers: {
          Accept: 'application/json'
        }
      })
    },

    getDeviceTemplates () {
      return this.getV1('devices/templates', { pageSize: 100 })
        .then((response) => {
          return response.data.deviceTemplates.results.reduce((templates, template) => {
            templates[template.id] = template
            return templates
          }, {})
        })
    },

    getOrganizations () {
      return this.getV1('organizations')
        .then((res) => res.data.organizations.results)
    },

    createDeviceTemplate (data) {
      return $http({
        method: 'POST',
        url: `https://${CONFIG.account.blueprintHost}/api/v1/devices/templates`,
        data: {
          accountId: CONFIG.account.accountId,
          name: data.templateName
        }
      }).then((res) => res.data.deviceTemplate)
    },

    createChannelTemplates (data) {
      const channelTemplates = data.channelNames.map((channelName) => {
        return $http({
          method: 'POST',
          url: `https://${CONFIG.account.blueprintHost}/api/v1/channels/templates`,
          data: {
            accountId: CONFIG.account.accountId,
            name: channelName,
            persistenceType: 'timeSeries',
            entityType: 'deviceTemplate',
            deviceTemplate: data.deviceTemplateName,
            entityId: data.deviceTemplateId
          }
        })
      })

      return Promise.all(channelTemplates)
    },

    createDevice (data) {
      const location = locationService.generateLocation()
      return $http({
        method: 'POST',
        url: `https://${CONFIG.account.blueprintHost}/api/v1/devices`,
        data: {
          accountId: CONFIG.account.accountId,
          deviceTemplateId: data.deviceTemplateId,
          organizationId: data.organizationId,
          serialNumber: `${data.deviceTemplateName}-000001`,
          longitude: location[0],
          latitude: location[1]
        }
      })
    },

    updateDevice (id, data) {
      return this.getV1(`devices/${id}`)
        .then((resp) => {
          const diff = _.reduce(resp.data.device, (result, value, key) => {
            if (!_.isEqual(value, data[key]) && key !== 'version' && !_.isArray(value) && !_.isObject(value)) {
              result[key] = data[key]
            }

            return result
          }, {})

          return $http({
            method: 'PUT',
            url: `https://${CONFIG.account.blueprintHost}/api/v1/devices/${id}`,
            data: diff,
            headers: {
              Etag: resp.data.device.version,
              Accept: 'application/json'
            }
          })
        })
    }
  }
}

module.exports = blueprintFactory
