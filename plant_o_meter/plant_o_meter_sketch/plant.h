#ifndef PLANT_H
#define PLANT_H

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Arduino.h>

#define UPDATE_SENSOR_VALUE    1

#define HUMIDITY_SENSOR        1
#define MOISTURE_SENSOR        2
#define TEMPERATURE_SENSOR     3

void setupMqtt(const char* ssid, const char* pwd, const char* server, uint16_t port);

void pushSensorData(uint8_t sensor, uint16_t value);

void handleEvents();

#endif
