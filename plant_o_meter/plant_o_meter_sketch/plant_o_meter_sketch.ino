/***************************************************************
 * plant-o-meter
 * 
 * Part of the smart-plant-care project.
 * 
 * Author  : Marion Nebuhr, Klaas Nebuhr
 * Created : 07.05.2018
 */

#include "plant.h"

#define DEBUG
#define DEEP_SLEEP_SECONDS    5 //1800
#define NUMBER_OF_TRIES      10

//const char* ssid        = "xxx";      
//const char* password    = "YYY";

const char* ssid        = "FRITZ!Box 6360 Cable";      
const char* password    = "4249789363748310";

const char* mqtt_server = "192.168.178.77";
const uint16_t port     = 1883;

void setup() {
  #ifdef DEBUG
  Serial.begin(9600);
  Serial.setTimeout(2000);
  #endif
  delay(2000);
  setupMqtt(ssid, password, mqtt_server, port);
  setupSensors();

  // Old Start of loop();
  //
  delay(2000);
  handleEvents();
  float temperature = getTemperature(NUMBER_OF_TRIES);
  if(isnan(temperature)) {
    #ifdef DEBUG
    Serial.println("Error while reading the temperature.");
    #endif 
  } else {
    pushSensorData(TEMPERATURE_SENSOR, scaledInt(temperature, 100));
    #ifdef DEBUG
    Serial.print("Temperatur: ");
    Serial.println(temperature);
    #endif
  }
  // Now reading the temperature value in celsius. If reading was successfull,
  // Send the data to the mqtt broker.
  float humidity = getHumidity(NUMBER_OF_TRIES);
  if(isnan(humidity)) {
    #ifdef DEBUG
    Serial.println("Error while reading the humidity.");
    #endif
    
  } else {
    pushSensorData(HUMIDITY_SENSOR, scaledInt(humidity, 100));
    #ifdef DEBUG
    Serial.print("Feuchtigkeit: ");
    Serial.println(humidity);
    #endif
  }
  pushRSSI();   // Sending the actual rssi to the mqtt broker
  hibernate(DEEP_SLEEP_SECONDS);
}

void loop() {}
