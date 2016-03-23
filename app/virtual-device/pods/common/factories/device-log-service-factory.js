'use strict';

var deviceLogService = [
    'mqttService', 'uuid',
    function(mqttService, uuid) {
        function createDeviceLogMessage(inputData){
            var now = Date.now().toString();

            return {
                "sourceId": inputData.deviceId,
                "sourceType": "deviceId",
                "accountId": inputData.accountId,
                "organizationId": inputData.organizationId,
                "templateId": inputData.templateId,
                "code": "1503",
                "message": inputData.message,
                "details": inputData.details,
                "severity": inputData.severity || "info",
                "tags": inputData.tags,
                "guid": uuid.v4(),
                "entryIndex": 7,
                "serviceTimestamp": now,
                "sourceTimestamp": now
            };
        }

        return {
            sendMalfunctionMessage: function(malfunctionData, channel){
                malfunctionData.severity = "error";
                var message = createDeviceLogMessage(malfunctionData);
                mqttService.sendMessage(JSON.stringify(message), channel);
            }
        };
}];

module.exports = deviceLogService;
