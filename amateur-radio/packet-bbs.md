# Setting up an AX.25 packet BBS

Goal: To host a BBS for receiving amateur radio traffic.

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

## Installing the tools for packet operation

`sudo apt-get install ax25-tools ax25-node ax25-apps telnet`

Note: telnet is used for local testing of access to the BBS

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

1. Reset the board by turning R6 all the way down. Power up, the light will blink at 1 Htz. Turn the R6 pot up slightly and power cycle.
2. Set the audio. Get a second HT and with your handheld plugged in, key up. You should hear a tone. Use a bit lower power than when the volume output on your receiver no longer increases.
3. Get the params to determine if your serial port is working. Use pitnc_getparams found on http://www.tnc-x.com/params.zip
4. If you don't get a connection, you may need to enable the serial interface by adding the following line at the bottom of /boot/config.txt: dtoverlay=pi3-miniuart-bt

notes on Pi3 and later
Seems you need to use `raspi-config` to disable the login over serial (the 1st question) but the second question that comes up enables the interface.

