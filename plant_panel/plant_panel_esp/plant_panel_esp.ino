#define FASTLED_ESP8266_RAW_PIN_ORDER
#include "FastLED.h"

#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

#define UDP_PACKET_SIZE 500
#define UDP_LISTENING_PORT 3548
#define NUM_LEDS 49
#define DATA_PIN D4

#define FILL_RGB         1
#define FILL_HSV         2
#define SET_PIXEL_AT_RGB 3
#define SET_PIXEL_AT_HSV 4

const char* ssid        = "FRITZ!Box 6360 Cable";      
const char* password    = "4249789363748310";
byte packetBuffer[ UDP_PACKET_SIZE ];

WiFiUDP udp;
CRGB leds[NUM_LEDS];

void setup() {
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  udp.begin(UDP_LISTENING_PORT);
  FastLED.addLeds<NEOPIXEL, DATA_PIN>(leds, NUM_LEDS);
  fill_solid(leds,NUM_LEDS,CRGB::Green);
  FastLED.show();
}

void loop() {
  int packetSize = udp.parsePacket();
  if (packetSize > 0)
  {
    Serial.print("Received packet of size ");
    Serial.println(packetSize);
    udp.read(packetBuffer, UDP_PACKET_SIZE);
    switch(packetBuffer[0]) {
      case FILL_RGB: 
        fill_solid(leds, NUM_LEDS, CRGB(packetBuffer[1],packetBuffer[2],packetBuffer[3]));
        FastLED.show();
        break;
      case FILL_HSV: 
        fill_solid(leds, NUM_LEDS, CHSV(packetBuffer[1],packetBuffer[2],packetBuffer[3]));
        FastLED.show();
        break;
      case SET_PIXEL_AT_RGB:
        leds[packetBuffer[1]] = CRGB(packetBuffer[2],packetBuffer[3],packetBuffer[4]);
        FastLED.show();
        break;        
      case SET_PIXEL_AT_HSV:
        leds[packetBuffer[1]] = CHSV(packetBuffer[2],packetBuffer[3],packetBuffer[4]);
        FastLED.show();
        break;        
    }
  }
}
