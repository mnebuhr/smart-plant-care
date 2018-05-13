'use strict';

var mqtt = require('mqtt')

let config = require('config');

let mqttConfig = config.get('MqttServer');

let mqtt_ip = mqttConfig.get('ip');
let mqtt_port = mqttConfig.get('port')


let elasticsearch = require('elasticsearch');
let elastic_client = new elasticsearch.Client({
  host: 'nebuhrhood:9200',
  log: 'trace'
});

console.log(`Using MqttServer at ${mqtt_ip}:${mqtt_port}`);

var client  = mqtt.connect(mqtt_ip)

let sensors = {
	1 : {
		name : 'HUMIDITY_SENSOR'
	},
	2 : {
		name : 'MOISTURE_SENSOR'
	},
	3 : {
		name : 'TEMPERATURE_SENSOR'
	}
}

elastic_client.ping({
  requestTimeout: 30000,
}, function (error) {
  if (error) {
    console.error('elasticsearch cluster is down!');
  } else {
    console.log('All is well');
  }
});

client.on('connect', function () {
	client.subscribe('/plant-o-meter/device/data')
})
 
client.on('message', function (topic, message) {
  console.log(topic.toString())
  let data = message;
  let mac =`${data[0].toString(16)}:${data[1].toString(16)}:${data[2].toString(16)}:${data[3].toString(16)}:${data[4].toString(16)}:${data[5].toString(16)}`;
  console.log('Message from ' + mac);
  let sensorId = data.readUInt8(6);
  let sensor = sensors[sensorId];
  let value  = data.readUInt16BE(7)/100;
  console.log('Sensor = ' + sensor.name);
  console.log('Value = ' + value);
  elastic_client.index({
  	index: 'testindex',
  	type: 'sensordata',
  	body: {
  		mac: mac,
  		sensor: sensorId,
  		name: sensor.name,
  		value: value,
  		timestamp: new Date()
  	}
  }).then(() => console.log("Stored value to elastic search"));
})