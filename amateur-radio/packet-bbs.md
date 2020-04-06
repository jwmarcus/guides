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
