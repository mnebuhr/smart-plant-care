#include <Adafruit_Sensor.h>
#include <DHT_U.h>
#include <DHT.h>

#define DEBUG

#include "plant.h"

#define DHTPIN            4         // Pin which is connected to the DHT sensor.
#define DHTTYPE           DHT22     // DHT 22 (AM2302)

DHT_Unified dht(DHTPIN, DHTTYPE);

sensors_event_t event;

WiFiClient espClient;
PubSubClient client(espClient);

char clientid[18];
static uint8_t data[16];   // Data Array for the mqtt message
static const char hex[17] = "0123456789ABCDEF";

#define USER_DATA 6

/**
 * Receives a new message.
 * For the moment this has no impact as we are only sending data.
 */
static void callback(char* topic, byte* payload, unsigned int length) {
    
}

uint16_t scaledInt(const float value, const uint8_t factor) {
  Serial.println(value);
  Serial.println((uint16_t)(value*factor+0.5));
  
  return (uint16_t)(value*factor+0.5);
}

void pushSensorData(uint8_t sensor, uint16_t value) {
  data[USER_DATA+0] = sensor;
  data[USER_DATA+1] = highByte(value);
  data[USER_DATA+2] = lowByte(value);
  client.publish("/plant-o-meter/device/data", data, USER_DATA+3);
}

static void startWIFI(const char* ssid, const char* password) {
  uint8_t index = 0;

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    #ifdef DEBUG
    Serial.print(".");
    #endif
  }

  #ifdef DEBUG
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  #endif

  WiFi.macAddress(data);

  for (uint8_t i = 0; i < 6; i++) {

    clientid[index++] = (char) (hex[(data[i] >> 4) & 0x0F]);
    clientid[index++] = (char) (hex[(data[i]) & 0x0F]);
    if (i < 5) {
      clientid[index++] = ':';
    }

  };
  clientid[index] = 0;
}

static void reconnect() {
  while (!client.connected()) {
    #ifdef DEBUG
    Serial.print(F("Attempting MQTT connection..."));
    #endif
    
    // Attempt to connect
    if (client.connect("plant-o-meter")) {
      #ifdef DEBUG
      Serial.println(F("connected"));
      #endif
      
      // ... and resubscribe
      client.subscribe("smart-plant");
    } else {
      #ifdef DEBUG
      Serial.print(F("failed, rc="));
      Serial.print(client.state());
      Serial.println(F(" try again in 5 seconds"));
      #endif
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
void setupSensors() {
  dht.begin();
  #ifdef DEBUG
  Serial.println("DHTxx Unified Sensor Example");
  #endif
  // Print temperature sensor details.
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  #ifdef DEBUG
  Serial.println("------------------------------------");
  Serial.println("Temperature");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println(" *C");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println(" *C");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println(" *C");  
  Serial.println("------------------------------------");
  #endif
  // Print humidity sensor details.
  dht.humidity().getSensor(&sensor);
  #ifdef DEBUG
  Serial.println("------------------------------------");
  Serial.println("Humidity");
  Serial.print  ("Sensor:       "); Serial.println(sensor.name);
  Serial.print  ("Driver Ver:   "); Serial.println(sensor.version);
  Serial.print  ("Unique ID:    "); Serial.println(sensor.sensor_id);
  Serial.print  ("Max Value:    "); Serial.print(sensor.max_value); Serial.println("%");
  Serial.print  ("Min Value:    "); Serial.print(sensor.min_value); Serial.println("%");
  Serial.print  ("Resolution:   "); Serial.print(sensor.resolution); Serial.println("%");  
  Serial.println("------------------------------------");  
  #endif
}

void setupMqtt(const char* ssid, const char* pwd, const char* server, uint16_t port) {
  startWIFI(ssid, pwd);
  client.setServer(server, port);
  client.setCallback(callback);
  reconnect();
  client.publish("/plant-o-meter/device/connect", clientid);
}

void handleEvents() {
  if (!client.connected()) {
    reconnect();
    // Once connected, publish an announcement...
    client.publish("/plant-o-meter/device/reconnect", clientid);
  }
  client.loop();
}

float getTemperature() {
  dht.temperature().getEvent(&event);
  return event.temperature;
}

float getHumidity() {
  dht.humidity().getEvent(&event);
  return event.relative_humidity;
}

