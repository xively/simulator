'use strict';

var deviceLogService = [
  'mqttService',
  function(mqttService) {
    function createDeviceLogMessage(inputData) {
      var informational = 'informational';
      var now = Date.now();
      var severity = inputData.severity || informational;
      var code = 400;
      if (severity === informational) {
        code = 200;
      }

      return {
        sourceTimestamp: now,
        sourceId: inputData.deviceId,
        accountId: inputData.accountId,
        code: code,
        message: inputData.message,
        details: inputData.details || inputData.message,
        severity: severity,
        tags: inputData.tags || []
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
