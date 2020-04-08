# Setting up an AX.25 packet BBS

## Goal:

To host a BBS for receiving amateur radio traffic.


## Prerequisites

A functioning Raspberry Pi with a serial connected KISS style TNC. Many are available like the MFJ-1270X, or the Coastal ChipWorks TNC-X. If you find a cheap source for a TNC, PLEASE EMAIL ME. I'm not thrilled with the $150 price tag for a KISS TNC from MFJ. :/


## Installing the tools for packet operation

`sudo apt-get install ax25-tools ax25-node ax25-apps telnet`

Note: telnet is used for local testing of access to the BBS


## Resetting the TNC-Pi to factory

From [the manual](https://tnc-x.com/TNCPi.pdf): Turning the TXDelay potentiometer (R6) all the way to minimum and then powering back up, you should see the yellow LED flash once per second. When you see it flash, you’ll know that the parameters have all been reset. The power the device back down, move the TXDelay off of minimum and power the device back up.


## Enable serial communication to the TNC-Pi:

Depending on your version and hardware, you will need to (1) disable the serial TTY and (2) enable serial communications. The easiest way to do this is to use `raspi-config`. Under interfacing/serial, disable the serial terminal (TTY) option. You will be prompted with a second prompt to enable JUST the serial ports.


## Confirm serial comm:

Download and unzip the two binary files located at http://www.tnc-x.com/params.zip and unzip. Use `chmod +x pitnc_*` to give those two files permissions to execute. Attempt to extract the settings on the board with `sudo ./pitnc_getparams /dev/serial0 0`. The port may vary slightly depending on your hardware. The `0` at the end tells the program to use serial mode vs i2c mode (uncommon). You should see something like the following:

```
Using Serial port /dev/serial0

   TNC Software Version           1
01 TXDelay - Zero means use ADC  40
02 Persistance                   64
03 Slottime (in 10 mS)           10
04 TXTail                         0
05 Full Duplex - Not used         0
06 Our Channel (Hex)             00
07 I2C Address (0 = async) Hex   00
   ADC Value                     50
```

If you fail to get this result (i.e. infinte retries), try other ports such as /dev/ttyS0, /dev/ttyAMA0, or you may need to disable the bluetooth chip in /boot/config with options to free up the uart chip like so:

```
dtoverlay=pi3-disable-bt
enable_uart=1
```


## Adjusting the volume levels

Get a second HT and tune to an unused frequency like 144.200 or the like. With your handheld plugged into the TNC, key up. You should hear a tone on the second unit. You can adjust volume levels to the HT using R7. Use an output level slightly lower on the TNC than the volume output where your receiver no longer increases.


# --- STOP ---

Now is the time to reality check the project. You should be able to:

1. Key up on a connected HT to the TNC-Pi and hear a solid tone on another HT. The tone should be full but not over-driven.
2. Run `pitnc_getparams` to get current settings from your TNC.


## Configuring axports

The /etc/ax25/axports file determines which interfaces are available to the rest of the AX 25 toolset, and therefore your BBS. Axports sets the values for the following (taken straight from Richard Osgood's [amazing guide](https://www.richardosgood.com/blog/how-to-setup-a-raspberry-pi-packet-radio-node-with-zork/).

If you had the line: `0  CALLSIGN-N  9600  255  2  145.030 MHz (1200bps)` in axports, you are telling the AX25 suite of tools the following:

- 0 – The name or number you assign to this device, used to reference in `kissattach`
- CALLSIGN-N – Callsign. The (-N) is a number from 1 to 15, it is optional but if you run multiple devices your SSID, as this is called, will tell each apart.
- 9600 – Baud rate of the device, NOT the protocol. 9600 baud is common.
- 255 – Packet length (paclen). The quantity of data you send with each transmission.
- 2 – Window. AX25 is a "GO BACK N" style of protocol with window size from 1 to 7 packets. Fel free to read [this paper from the University of Bucharest](https://ftp.unpad.ac.id/orari/library/library-sw-hw/amateur-radio/packet-radio/simp.pdf) if you would like to learn more. 2 is a fine number.
- 145.030 MHz (1200bps) – This is a text description of the port.

## Configuring ax25 daemon 

Per [the documentation](http://manpages.ubuntu.com/manpages/trusty/man5/ax25d.conf.5.html) each callsign entry line is of the format `peer window t1 t2 t3 idle n2 mode uid exec args...`. "Specifying a * for the AX.25 port name allows the following callsign entries to be valid for all the operating AX.25 ports using the callsign specified."

# Setting up the TNC-pi

Here is the order I do things:

3. Get the params to determine if your serial port is working. Use pitnc_getparams found on http://www.tnc-x.com/params.zip
4. If you don't get a connection, you may need to enable the serial interface by adding the following line at the bottom of /boot/config.txt: dtoverlay=pi3-miniuart-bt

notes on Pi3 and later
Seems you need to use `raspi-config` to disable the login over serial (the 1st question) but the second question that comes up enables the interface.

Notes from W9IQ:

```
Assuming that you have:

correctly connected your Baofeng to the TNC
installed the AX25-tools and AX25-apps
configured /etc/ax25/axports with your call and the baud rate
attached the serial port to the AX.25 system using kissattach
then you may first want to listen for AX25 traffic on that frequency by typing:

 sudo axlisten –a
Finally, you can connect to the BBC by typing:

 axcall 1 WE1CT-4
There should be a short pause and then you will see the splash screen from the BBS.
```

