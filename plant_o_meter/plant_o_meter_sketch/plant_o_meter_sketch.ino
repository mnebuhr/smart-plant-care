/***************************************************************
 * plant-o-meter
 * 
 * Part of the smart-plant-care project.
 * 
 * Author  : Marion Nebuhr, Klaas Nebuhr
 * Created : 07.05.2018
 */

 #include "plant.h"

const char* ssid        = "xxx";      
const char* password    = "YYY";
const char* mqtt_server = "xxx.xxx.xxx.xxx";
const uint16_t port     = 999;

void setup() {
  setupMqtt(ssid, password, mqtt_server, port);
}

void loop() {
  handleEvents();
  pushSensorData(TEMPERATURE_SENSOR, 10);
  delay(5000);
  
}
