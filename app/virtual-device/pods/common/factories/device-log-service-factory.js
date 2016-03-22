'use strict';

var deviceLogService = [
    'sensorStore', 'mqttService',
    function(sensorStore, mqttService) {
    return {
        sendMalfunctionMessage: function(malfunctionData, channel){
            var message = {
                serviceTimestamp: Date.now().toUTCString()
            };
            mqttService.sendMessage(JSON.stringify(message), channel);
        }
    };
}];

module.exports = deviceLogService;
