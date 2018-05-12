/***************************************************************
 * plant-o-meter
 * 
 * Part of the smart-plant-care project.
 * 
 * Author  : Marion Nebuhr, Klaas Nebuhr
 * Created : 07.05.2018
 */

#define DEBUG
#include "plant.h"

//const char* ssid        = "xxx";      
//const char* password    = "YYY";

const char* mqtt_server = "nebuhr";
const uint16_t port     = 1883;

void setup() {
  setupMqtt(ssid, password, mqtt_server, port);
  Serial.begin(9600);
  setupSensors();
}

void loop() {
  Serial.println("Loop");
  handleEvents();
  //pushSensorData(TEMPERATURE_SENSOR, 10);
  Serial.println("Reading temperature");
  float temperature = getTemperature();
  Serial.println("Done");
  if(isnan(temperature)) {
    Serial.println("Error while reading the temperature.");
  } else {
    Serial.println(temperature);
  }
  delay(5000);  
  
}
