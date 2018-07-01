#define DEBUG

// Wird kein DeepSleep Modus verwendet, wird
// hier festgelegt, wie lange zwischen zwei 
// Messzyklen gewartet werden soll.
//
#define DELAY_SECONDS        10

// Anzahl der Versuche, den Sensorwert auszulesen. 
// Konnte nach der Anzahl der Versuche der Wert
// nicht gelesen werden, dann wird NaN zurückgegeben.
//
#define NUMBER_OF_TRIES      10

// Flag, ob der DeepSleep Modus verwendet werden soll.
// Wenn DeepSleep genutzt wird, dann wird die 
// Pause durch DEEP_SLEEP_SECONDS festgelegt.
//
//#define USE_DEEP_SLEEP
#define DEEP_SLEEP_SECONDS   1200

// Flags, welche Sensoren angeschlossen sind.
// Ist ein Sensor nicht angeschlossen (oder soll
// nicht verwendet werden, dann die entsprechende
// Zeile auskommentieren.
#define F_WATER_PUMP
#define F_WIFI_SIGNAL_QUALITY
#define F_MOISTURE_SENSOR
//#define F_TEMPERATURE_SENSOR
//#define F_HUMIDITY_SENSOR

#define UPDATE_SENSOR_VALUE    1

// Konstanten für das Mqtt Protokoll. DO NOT CHANGE!!!
#define HUMIDITY_SENSOR        1
#define MOISTURE_SENSOR        2
#define MOISTURE_SENSOR_RAW   12
#define TEMPERATURE_SENSOR     3

// Pin Belegungen
#define MOISTURE_SENSOR_PIN   A0
#define PUMP_PIN              D1
#define DHTPIN                D4     // Pin which is connected to the DHT sensor.
#define DHTTYPE            DHT22     // DHT 22 (AM2302)

//#define ESPFix  // WiFi fix: https://github.com/esp8266/Arduino/issues/2186
//#define MQTTLOG

// Für das Mqtt Protokoll relevant
// !!! DO NOT CHANGE !!!
//
#define USER_DATA 6

