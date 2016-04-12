'use strict';

var deviceLogService = [
  'mqttService', 'uuid',
  function(mqttService, uuid) {
    function createDeviceLogMessage(inputData) {
      var informational = 'informational';
      var now = Date.now().toString();
      var severity = inputData.severity || informational;
      var code = '400';
      if (severity === informational) {
        code = '200';
      }

      return {
        sourceId: inputData.deviceId,
        sourceType: 'deviceId',
        accountId: inputData.accountId,
        organizationId: inputData.organizationId,
        templateId: inputData.templateId || uuid.v4(),
        code: code,
        message: inputData.message,
        severity: severity,
        details: inputData.details || inputData.message,
        tags: inputData.tags || [],
        guid: uuid.v4(),
        entryIndex: '7',
        serviceTimestamp: now,
        sourceTimestamp: now
      };
    }

    function sendDeviceLogMessage(inputData, channel, severity) {
      inputData.severity = severity;
      var message = createDeviceLogMessage(inputData);
      mqttService.sendMessage(JSON.stringify(message), channel);
    }

    return {
      sendErrorMessage: function(errorData, channel) {
        sendDeviceLogMessage(errorData, channel, 'error');
      },
      sendInfoMessage: function(infoData, channel) {
        sendDeviceLogMessage(infoData, channel);
      }
    };
  }];

module.exports = deviceLogService;
