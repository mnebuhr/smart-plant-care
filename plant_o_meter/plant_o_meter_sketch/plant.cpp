#include "plant.h"

WiFiClient espClient;
PubSubClient client(espClient);

static uint8_t analog_humidity_sensor_pin;

void callback(char* topic, byte* payload, unsigned int length) {
  
}

void setupHumiditySensor(const uint8_t pin) {
  analog_humidity_sensor_pin = pin;
}

void setupMqtt(const char* ssid, const char* pwd, const char* server, uint16_t port) {
  client.setServer(server, port);
  client.setCallback(callback);
  client.publish("plant-o-meter/device/register", "clientid");
}

void reconnect() {
  while (!client.connected()) {
    Serial.print(F("Attempting MQTT connection..."));
    // Attempt to connect
    if (client.connect("plant-o-meter")) {
      Serial.println(F("connected"));
      // Once connected, publish an announcement...
      client.publish("plant-o-meter/device/reconnect", "hello world");
      // ... and resubscribe
      client.subscribe("ecosystem");
    } else {
      Serial.print(F("failed, rc="));
      Serial.print(client.state());
      Serial.println(F(" try again in 5 seconds"));
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void handleEvents() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
}

