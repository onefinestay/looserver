#include <SPI.h>
#include <avr/sleep.h>
#include <avr/power.h>
#include "nRF24L01.h"
#include "RF24.h"
#include "printf.h"


// Arduino Pins
int lock_vcc = 2;
int lock_status = 3;
int status_led = 13;
int buzzer = 6;
int LOO_ID = 1;
int DOOR_ID = 1;

// RF
int CHANNEL = 1;      //MAX 127
RF24 radio(8, 7);
byte pipes[][6] = {"1Node","2Node"};

// Sleep declarations
typedef enum { wdt_16ms = 0, wdt_32ms, wdt_64ms, wdt_128ms, wdt_250ms, wdt_500ms, wdt_1s, wdt_2s, wdt_4s, wdt_8s } wdt_prescalar_e;
void setup_watchdog(uint8_t prescalar);
void do_sleep(void);
const short sleep_cycles_per_transmission = 4;
volatile short sleep_cycles_remaining = sleep_cycles_per_transmission;

void setup() {
  Serial.begin(57600);
  printf_begin();
  printf("*** LOOrdoino is starting\n\r");

  pinMode(buzzer, OUTPUT);
  pinMode(lock_vcc, OUTPUT);
  pinMode(lock_status, INPUT);
  pinMode(status_led, OUTPUT);
  
  digitalWrite(buzzer, LOW);
  digitalWrite(lock_vcc, HIGH);
  
  // Setup watchdog
  setup_watchdog(wdt_500ms);
  
  // Setup and configure rf radio
  radio.begin();                          // Start up the radio
  radio.setChannel(CHANNEL);
  //radio.setPALevel(RF24_PA_HIGH);
  radio.setAutoAck(1);                    // Ensure autoACK is enabled
  radio.setRetries(15,15);                // Max delay between retries & number of retries
  //radio.setPayloadSize(sizeof(int));
  //radio.setDataRate(RF24_250KBPS);
  radio.openWritingPipe(pipes[1]);
  radio.openReadingPipe(1,pipes[0]);
  radio.printDetails();                   // Dump the configuration of the rf unit for debugging
  radio.stopListening();
  }


void send_message ( boolean state ){
  int payload = LOO_ID * 100;
  payload = payload + (DOOR_ID * 10);
  int write_status;
  
  if (state == HIGH) {
    printf("Toilet engaged\n\r");
    payload += 1;
  } else {
    printf("Toilet free\n\r");
  }
  
  //radio.stopListening();                                    // First, stop listening so we can talk.
  write_status = radio.write( &payload, sizeof(int) );
  if (!write_status){ 
    printf("Error sending. Code: %d\n\r", write_status);
    report_led(2, 150);
  } else {
    printf("Payload: %i\n\r", payload);
  }
  report_led(2, 50);
}

void report_led(int times, int timeout){
  while (times){
    digitalWrite(status_led, HIGH);
    delay(timeout);
    digitalWrite(status_led, LOW);
    times -= 1;
  }
}

void loop(void){
  report_led(1, 50);
  radio.powerUp();
  //radio.startListening();
  int lock_state = digitalRead(lock_status);
  send_message(lock_state);
  delay(100);
  radio.powerDown();              // NOTE: The radio MUST be powered back up again manually
                                    // Sleep the MCU.
  do_sleep();
}


void wakeUp(){
  sleep_disable();
}
// Sleep helpers
//Prescaler values
// 0=16ms, 1=32ms,2=64ms,3=125ms,4=250ms,5=500ms
// 6=1 sec,7=2 sec, 8=4 sec, 9= 8sec
void setup_watchdog(uint8_t prescalar){
  uint8_t wdtcsr = prescalar & 7;
  if ( prescalar & 8 )
    wdtcsr |= _BV(WDP3);
  MCUSR &= ~_BV(WDRF);                      // Clear the WD System Reset Flag
  WDTCSR = _BV(WDCE) | _BV(WDE);            // Write the WD Change enable bit to enable changing the prescaler and enable system reset
  WDTCSR = _BV(WDCE) | wdtcsr | _BV(WDIE);  // Write the prescalar bits (how long to sleep, enable the interrupt to wake the MCU
}

ISR(WDT_vect)
{
  //--sleep_cycles_remaining;
  Serial.println("WDT");
}

void do_sleep(void)
{
  set_sleep_mode(SLEEP_MODE_PWR_DOWN); // sleep mode is set here
  sleep_enable();
  attachInterrupt(0,wakeUp,LOW);
  WDTCSR |= _BV(WDIE);
  sleep_mode();                        // System sleeps here
                                       // The WDT_vect interrupt wakes the MCU from here
  sleep_disable();                     // System continues execution here when watchdog timed out  
  detachInterrupt(0);  
  WDTCSR &= ~_BV(WDIE);  
}
