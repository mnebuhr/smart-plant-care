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

const char* ssid        = "FRITZ!Box 6360 Cable";      
const char* password    = "4249789363748310";

const char* mqtt_server = "192.168.178.77";
const uint16_t port     = 1883;



void setup() {
  Serial.begin(9600);
  delay(2000);
  setupMqtt(ssid, password, mqtt_server, port);
  setupSensors();
}

void loop() {
  handleEvents();
  float temperature = getTemperature();
  if(isnan(temperature)) {
    Serial.println("Error while reading the temperature.");
  } else {
    pushSensorData(TEMPERATURE_SENSOR, scaledInt(temperature, 100));
    Serial.println(temperature);
  }
  // Now reading the temperature value in celsius. If reading was successfull,
  // Send the data to the mqtt broker.
  float humidity = getHumidity();
  if(isnan(humidity)) {
    Serial.println("Error while reading the humidity.");
  } else {
    pushSensorData(HUMIDITY_SENSOR, scaledInt(humidity, 100));
    Serial.println(humidity);
  }
  pushRSSI();   // Sending the actual rssi to the mqtt broker
  hibernate(5); // Go to hibernate mode (deep sleep) for 5 seconds
}
