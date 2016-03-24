'use strict';

// An interface between our fan store and our MQTT channels
var purifierResettingService = [
    '$rootScope', 'mqttService', 'deviceLogService',
    function(
        $rootScope, mqttService, deviceLogService
    ) {
        function sendResetNotify(deviceData, deviceLogChannel){
            deviceData.message = 'Factory reset command received';
            deviceData.details = deviceData.message;
            deviceData.tags = ['reset', 'received'];
            deviceLogService.sendResetCommandReceivedMessage(deviceData, deviceLogChannel);

            $rootScope.$broadcast('device.reset', null, null);
            deviceData.message = 'Device is being reset';
            deviceData.details = deviceData.message;
            deviceData.tags = ['reset', 'resetting'];
            deviceLogService.sendResettingMessage(deviceData, deviceLogChannel);

            setTimeout(function(){sendRecoveredNotify(deviceData, deviceLogChannel);}, 5000);
        }

        function sendRecoveredNotify(deviceData, deviceLogChannel){
            $rootScope.$broadcast('device.recovered', null, null);

            deviceData.message = 'Device recovered from error';
            deviceData.details = deviceData.message;
            deviceData.tags = ['reset', 'recovered'];
            deviceLogService.sendRecoveredMessage(deviceData, deviceLogChannel);
        }

        return {
            init: function(deviceData, controlChannel, deviceLogChannel) {
                mqttService.subscribe(controlChannel, function(mqttMessage) {
                    debugger;
                    var parsedMessage = null;
                    try {
                        parsedMessage = JSON.parse(mqttMessage.payloadString);
                    }
                    catch (e) {
                        parsedMessage = {};
                    }
                    if (parsedMessage.message.command === 'factory-reset'){
                        sendResetNotify(deviceData, deviceLogChannel);
                    }
                });
            }
        };
    }];

module.exports = purifierResettingService;