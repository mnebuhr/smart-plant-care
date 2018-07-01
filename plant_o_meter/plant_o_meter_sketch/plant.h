#ifndef PLANT_H
#define PLANT_H

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Arduino.h>

void setDeepSleepTimer(uint16_t seconds);

void setupMqtt(const char* ssid, const char* pwd, const char* server, uint16_t port);

void setupSensors();

void pushSensorData(uint8_t sensor, uint16_t value);

void pushData();

void pushWifiSignalQuality(uint8_t number_of_tries);

void handleEvents();

float getTemperature(uint8_t number_of_tries);

float getHumidity(uint8_t number_of_tries);

uint8_t getMoisture(const uint8_t pin, const uint16_t minValue, const uint16_t maxValue); 

uint16_t getMoistureRaw(const uint8_t pin);

uint16_t scaledInt(const float value, const uint8_t factor);

void hibernate();

#endif
