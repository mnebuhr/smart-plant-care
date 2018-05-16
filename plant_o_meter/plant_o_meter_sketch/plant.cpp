#include <Adafruit_Sensor.h>
#include <DHT_U.h>
#include <DHT.h>

//#define DEBUG
//#define ESPFix  // WiFi fix: https://github.com/esp8266/Arduino/issues/2186

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
static char* m_ssid;
static char* m_password;


#define USER_DATA 6

/**
 * Receives a new message.
 * For the moment this has no impact as we are only sending data.
 */
static void callback(char* topic, byte* payload, unsigned int length) {
    
}

uint16_t scaledInt(const float value, const uint8_t factor) {
  return (uint16_t)(value*factor+0.5);
}

static void startWIFI(const char* ssid, const char* password) {
  uint8_t index = 0;
  //m_ssid     = ssid;
  //m_password = paasword;

  WiFi.begin(ssid, password);

  #ifdef ESPFix
  WiFi.persistent(false);
  WiFi.mode(WIFI_OFF);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  #endif
  
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

void pushSensorData(uint8_t sensor, uint16_t value) {
  reconnect();
  #ifdef DEBUG
  Serial.print(F("Pushing sensor data to mqtt broker. Connected:"));
  #endif
  data[USER_DATA+0] = sensor;
  data[USER_DATA+1] = highByte(value);
  data[USER_DATA+2] = lowByte(value);
  #ifdef DEBUG
  Serial.println(client.connected());
  Serial.print(F("Client MAC: "));Serial.println(clientid);
  #endif
  client.publish("/plant-o-meter/device/data", data, USER_DATA+3);
  client.loop();
}

uint8_t getMoisture(const uint8_t pin, const uint16_t minValue, const uint16_t maxValue) {
  #ifdef DEBUG
  Serial.print(F("Reading moisture sensor value"));
  #endif
  //map(output_value,1024,310,0,100);
  return map(analogRead(pin),minValue,maxValue,0,100);
}

void setupSensors() {
  dht.begin();
  #ifdef DEBUG
  Serial.println(F("DHTxx Unified Sensor Example"));
  #endif
  // Print temperature sensor details.
  sensor_t sensor;
  dht.temperature().getSensor(&sensor);
  #ifdef DEBUG
  Serial.println(F("------------------------------------"));
  Serial.println(F("Temperature"));
  Serial.print  (F("Sensor:       ")); Serial.println(sensor.name);
  Serial.print  (F("Driver Ver:   ")); Serial.println(sensor.version);
  Serial.print  (F("Unique ID:    ")); Serial.println(sensor.sensor_id);
  Serial.print  (F("Max Value:    ")); Serial.print(sensor.max_value); Serial.println(" *C");
  Serial.print  (F("Min Value:    ")); Serial.print(sensor.min_value); Serial.println(" *C");
  Serial.print  (F("Resolution:   ")); Serial.print(sensor.resolution); Serial.println(" *C");  
  Serial.println(F("------------------------------------"));
  #endif
  // Print humidity sensor details.
  dht.humidity().getSensor(&sensor);
  #ifdef DEBUG
  Serial.println(F("------------------------------------"));
  Serial.println(F("Humidity"));
  Serial.print  (F("Sensor:       ")); Serial.println(sensor.name);
  Serial.print  (F("Driver Ver:   ")); Serial.println(sensor.version);
  Serial.print  (F("Unique ID:    ")); Serial.println(sensor.sensor_id);
  Serial.print  (F("Max Value:    ")); Serial.print(sensor.max_value); Serial.println("%");
  Serial.print  (F("Min Value:    ")); Serial.print(sensor.min_value); Serial.println("%");
  Serial.print  (F("Resolution:   ")); Serial.print(sensor.resolution); Serial.println("%");  
  Serial.println(F("------------------------------------"));  
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

float getTemperature(uint8_t number_of_tries) {
  while(number_of_tries > 0) {
    dht.temperature().getEvent(&event);
    if (!isnan(event.temperature)) return event.temperature;
    number_of_tries--;
  }
  return event.temperature;
}

float getHumidity(uint8_t number_of_tries) {
  while(number_of_tries > 0) {
    dht.humidity().getEvent(&event);
    if (!isnan(event.relative_humidity)) return event.relative_humidity;
    number_of_tries--;
  }
  return event.relative_humidity;
}

/**
   Return the quality (Received Signal Strength Indicator)
   of the WiFi network.
   Returns a number between 0 and 100 if WiFi is connected.
   Returns -1 if WiFi is disconnected.

   Thanks to tttapa. 
   From the git repo https://github.com/tttapa/Projects/blob/master/ESP8266/WiFi/RSSI-WiFi-Quality/RSSI-WiFi-Quality.ino
*/
uint8_t getRSSI() {
  if (WiFi.status() != WL_CONNECTED) return -1;
  int dBm = WiFi.RSSI();
  if (dBm <= -100) return 0;
  if (dBm >= -50) return 100;
  return 2 * (dBm + 100);  
}

void pushWifiSignalQuality(uint8_t number_of_tries) {
  reconnect();
  while(number_of_tries > 0) {
    uint8_t rssi = getRSSI();
    #ifdef DEBUG
    Serial.print(F("Empfang in db:"));
    Serial.println(rssi);
    #endif
    if (rssi >= 0) {
      data[USER_DATA+0] = rssi;    
      client.publish("/plant-o-meter/device/rssi", data, USER_DATA+1);
      client.loop();  
      return;
    }
    number_of_tries--;
  }
}

/**
 * Puts the nodemcu board into deep sleep mode. 
 * The GPI16 Pin has to be connected to RST.
 * Any code after this line will not be executed, 
 * because when the hibernate phase ends, the
 * board will be resetted.
 */
void hibernate(uint8_t seconds) {
  client.publish("/plant-o-meter/device/hibernate", clientid);
  delay(2000);
  #ifdef DEBUG
  Serial.print(F("Deep Sleep in seconds: "));
  Serial.println(seconds);
  #endif
  ESP.deepSleep(seconds * 10e6); // deepSleep needs parameter to be in microseconds
}

