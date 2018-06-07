/***************************************************************
 * plant-o-meter
 * 
 * Part of the smart-plant-care project.
 * 
 * Author  : Marion Nebuhr, Klaas Nebuhr
 * Created : 07.05.2018
 */

#include "plant.h"

//#define DEBUG

#define DEEP_SLEEP_SECONDS   1200
#define NUMBER_OF_TRIES      10
#define MOISTURE_SENSOR_PIN  A0

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
  setupMqtt(ssid, password, mqtt_server, port);
  setupSensors();
  setDeepSleepTimer(1200);

  // Old Start of loop();
  //
  handleEvents();
  pushWifiSignalQuality(NUMBER_OF_TRIES);   // Sending the actual rssi to the mqtt broker
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

  const uint8_t moisture = getMoisture(MOISTURE_SENSOR_PIN,900,280);
  pushSensorData(MOISTURE_SENSOR, moisture*100);

  pushSensorData(MOISTURE_SENSOR_RAW,getMoistureRaw(MOISTURE_SENSOR_PIN)); 
  
  hibernate();
}

void loop() {
}
