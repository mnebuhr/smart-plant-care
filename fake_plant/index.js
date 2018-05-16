'use strict';

var mqtt = require('mqtt')

let config = require('config');

let mqttConfig = config.get('MqttServer');
let plantsConfig = config.get('Plants');

let mqtt_ip = mqttConfig.get('ip');
let mqtt_port = mqttConfig.get('port')

let intervall = plantsConfig.get('intervall') * 1000;

console.log(`Using MqttServer at ${mqtt_ip}:${mqtt_port}`);

var client  = mqtt.connect(mqtt_ip);

client.on('connect', function () {
	let interValObj = setInterval(() => {
		let randVal = Math.floor(Math.random() * Math.floor(5));
		console.log(`Sending plant data ${randVal}`);
	}, intervall);
})

