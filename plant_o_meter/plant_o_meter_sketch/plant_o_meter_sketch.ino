/***************************************************************
 * plant-o-meter
 * 
 * Part of the smart-plant-care project.
 * 
 * Author  : Marion Nebuhr, Klaas Nebuhr
 * Created : 07.05.2018
 */


#include "config.h"
#include "plant.h"

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
  
  #ifdef USE_DEEP_SLEEP
    setDeepSleepTimer(1200);
    pushData();
    hibernate();
  #endif
}

void loop() {
  #ifndef USE_DEEP_SLEEP
    pushData();
    delay(DELAY_SECONDS * 1000);
    #ifdef DEBUG
    Serial.print("Pushing sensor data to server. Delaying for ");
    Serial.print(DELAY_SECONDS);
    Serial.println(" seconds.");
    #endif  
  #endif
}
