/*
 Copyright (C) 2011 J. Coliz <maniacbug@ymail.com>

 This program is free software; you can redistribute it and/or
 modify it under the terms of the GNU General Public License
 version 2 as published by the Free Software Foundation.

 03/17/2013 : Charles-Henri Hallard (http://hallard.me)
              Modified to use with Arduipi board http://hallard.me/arduipi
						  Changed to use modified bcm2835 and RF24 library
TMRh20 2014 - Updated to work with optimized RF24 Arduino library

 */

/**
 * Example RF Radio Ping Pair
 *
 * This is an example of how to use the RF24 class on RPi, communicating to an Arduino running
 * the GettingStarted sketch.
 */

#include <cstdlib>
#include <iostream>
#include <sstream>
#include <string>
#include <time.h>
#include <unistd.h>
#include <RF24/RF24.h>
#include <hiredis.h>

using namespace std;
//
// Hardware configuration
//

// CE Pin, CSN Pin, SPI Speed

// Setup for GPIO 22 CE and CE1 CSN with SPI Speed @ 1Mhz
//RF24 radio(RPI_V2_GPIO_P1_22, RPI_V2_GPIO_P1_26, BCM2835_SPI_SPEED_1MHZ);

// Setup for GPIO 22 CE and CE0 CSN with SPI Speed @ 4Mhz
//RF24 radio(RPI_V2_GPIO_P1_15, BCM2835_SPI_CS0, BCM2835_SPI_SPEED_4MHZ);

// Setup for GPIO 22 CE and CE0 CSN with SPI Speed @ 8Mhz
RF24 radio(RPI_V2_GPIO_P1_15, RPI_V2_GPIO_P1_24, BCM2835_SPI_SPEED_8MHZ);


// Radio pipe addresses for the 2 nodes to communicate.
const uint8_t pipes[][6] = {"1Node","2Node"};
//const uint64_t pipes[2] = { 0xABCDABCD71LL, 0x544d52687CLL };



int main(int argc, char** argv){
  timespec time;
  // for some reason read() reads 8 bytes, not 1, so make sure we allocate
  // enough memory; otherwise it scribbles over other memory
  int paylad[8];

  // Setup redis
  redisContext *conn;
  redisReply *reply;
  // const char *hostname = (argc > 1) ? argv[1] : "127.0.0.1";
  // int port = (argc > 2) ? atoi(argv[2]) : 6379;
  const char *hostname = "127.0.0.1";
  int port = 6379;


  struct timeval timeout = { 1, 500000 }; // 1.5 seconds
  conn = redisConnectWithTimeout(hostname, port, timeout);
  if (conn == NULL || conn->err) {
      if (conn) {
          printf("Connection error: %s\n", conn->errstr);
          redisFree(conn);
      } else {
          printf("Connection error: can't allocate redis context\n");
      }
      exit(1);
  }

  // Setup and configure rf radio
  radio.begin();

  radio.setChannel(1);
  // optionally, increase the delay between retries & # of retries
  radio.setRetries(15,15);
  // Dump the configuration of the rf unit for debugging
  radio.printDetails();


/***********************************/
  // This simple sketch opens two pipes for these two nodes to communicate
  // back and forth.

  radio.openWritingPipe(pipes[1]);
  radio.openReadingPipe(1,pipes[0]);
  radio.startListening();

	// forever loop
	while (1)
	{
		//
		// Pong back role.  Receive each packet, dump it out, and send it back
		//


        // if there is data ready
        //printf("Check available...\n");

        if ( radio.available() )
        {

            // Fetch the payload, and see if this was the last one.
            radio.read( paylad, sizeof(int) );

            clock_gettime(CLOCK_REALTIME, &time);

            cout << "Received: " << paylad[0] << ", at " << time.tv_sec << "." << time.tv_nsec << endl;

            // publich to redis
            reply = (redisReply *) redisCommand(conn,"SET loo:%lu 1", paylad[0]);
            freeReplyObject(reply);
            reply = (redisReply *) redisCommand(conn,"EXPIRE loo:%lu 2", paylad[0]);
            freeReplyObject(reply);

        }

    usleep(100 * 1000); // microseconds
	} // forever loop


  redisFree(conn);

  return 0;
}

