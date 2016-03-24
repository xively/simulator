'use strict';

var deviceLogService = [
    'mqttService', 'uuid',
    function(mqttService, uuid) {
        function createDeviceLogMessage(inputData){
            var now = Date.now().toString();
            var severity = inputData.severity || "info";
            var code = 400;
            if (severity == 'info'){
                code = 200;
            }

            return {
                "sourceId": inputData.deviceId,
                "sourceType": "deviceId",
                "accountId": inputData.accountId,
                "organizationId": inputData.organizationId,
                "templateId": inputData.templateId,
                "code": code,
                "message": inputData.message,
                "details": inputData.details,
                "severity": severity,
                "tags": inputData.tags,
                "guid": uuid.v4(),
                "entryIndex": 7,
                "serviceTimestamp": now,
                "sourceTimestamp": now
            };
        }

        function sendDeviceLogMessage(inputData, channel, severity){
            inputData.severity = severity;
            var message = createDeviceLogMessage(inputData);
            mqttService.sendMessage(JSON.stringify(message), channel);
        }

        return {
            sendMalfunctionMessage: function(malfunctionData, channel){
                sendDeviceLogMessage(malfunctionData, channel, 'error');
            },
            sendResetCommandReceivedMessage: function(deviceData, channel){
                sendDeviceLogMessage(deviceData, channel);
            },
            sendResettingMessage: function(deviceData, channel){
                sendDeviceLogMessage(deviceData, channel);
            },
            sendRecoveredMessage: function(deviceData, channel){
                sendDeviceLogMessage(deviceData, channel);
            },
        };
}];

module.exports = deviceLogService;
