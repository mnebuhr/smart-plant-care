#define FASTLED_ESP8266_RAW_PIN_ORDER
#include "FastLED.h"

#include <ESP8266WiFi.h>
#include <WiFiUdp.h>

#define UDP_PACKET_SIZE 500
#define UDP_LISTENING_PORT 3548
#define NUM_LEDS 49
#define DATA_PIN D4

// COMMANDS
#define FILL             1
#define WRITE_RAW        2
#define SET_PIXEL_AT     3
#define SHOW             4

//FLAGS
#define UPDATE           2

const char* ssid        = "FRITZ!Box 6360 Cable";      
const char* password    = "4249789363748310";
byte packetBuffer[ UDP_PACKET_SIZE ];

WiFiUDP udp;
CRGB leds[NUM_LEDS];

void setup() {
  Serial.begin(9600);
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
    udp.read(packetBuffer, UDP_PACKET_SIZE);
    switch(packetBuffer[0]) {
      case FILL: 
        fill_solid(leds, NUM_LEDS, CRGB(packetBuffer[2],packetBuffer[3],packetBuffer[4]));
        if (packetBuffer[1] & UPDATE) FastLED.show(); 
        break;
      case SET_PIXEL_AT:
        leds[packetBuffer[2]] = CRGB(packetBuffer[3],packetBuffer[4],packetBuffer[5]);
        if (packetBuffer[1] & UPDATE) FastLED.show(); 
        break;        
      case WRITE_RAW:
        Serial.println(F("Writing raw data"));
        // Array Copy von packetBuffer to leds;
        /**
         * Byte:
         * 0: Command
         * 1: Flags
         * 2: Number of Leds
         * 3: Offset (Which led to start from)
         */
        Serial.print(F("Number of leds: ")); Serial.println(packetBuffer[2]);
        Serial.print(F("Offset: ")); Serial.println(packetBuffer[3]);
         
        memcpy(leds+(packetBuffer[3]*3),packetBuffer+4,packetBuffer[2]*3);
        if (packetBuffer[1] & UPDATE) FastLED.show(); 
        break;
      case SHOW:
        FastLED.show();
        break;
    }
  }
}
