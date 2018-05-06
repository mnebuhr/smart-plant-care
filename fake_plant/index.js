'use strict';

let config = require('config');

let mqttConfig = config.get('MqttServer');

let mqtt_ip = mqttConfig.get('ip');
let mqtt_port = mqttConfig.get('port')

console.log(`Using MqttServer at ${mqtt_ip}:${mqtt_port}`);
