#ifndef PLANT_H
#define PLANT_H

#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Arduino.h>


void setupHumiditySensor(const uint8_t pin);

void setupMqtt(const char* ssid, const char* pwd, const char* server, uint16_t port);

void handleEvents();

#endif
