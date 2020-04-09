# Setting up an AX.25 packet BBS

## Goal:

To host a BBS for receiving amateur radio traffic.


## Prerequisites

A functioning Raspberry Pi with a serial connected KISS style TNC. Many are available like the MFJ-1270X, or the Coastal ChipWorks TNC-X. If you find a cheap source for a TNC, PLEASE SUBMIT A PR WITH INFORMATION. I'm not thrilled with the $150 price tag for a KISS TNC from MFJ. :/


## Resetting the TNC-Pi to factory

From [the manual](https://tnc-x.com/TNCPi.pdf): Turning the TXDelay potentiometer (R6) all the way to minimum and then powering back up, you should see the yellow LED flash once per second. When you see it flash, you’ll know that the parameters have all been reset. The power the device back down, move the TXDelay off of minimum and power the device back up.


## Enable serial communication to the TNC-Pi:

Depending on your version and hardware, you will need to (1) disable the serial TTY and (2) enable serial communications. The easiest way to do this is to use `raspi-config`. Under interfacing/serial, disable the serial terminal (TTY) option. You will be prompted with a second prompt to enable JUST the serial ports.


## Confirm serial communication:

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

If you fail to get this result (i.e. infinite retries), try other ports such as /dev/ttyS0, /dev/ttyAMA0, or you may need to disable the bluetooth chip in /boot/config with options to free up the uart chip like so:

```
dtoverlay=pi3-disable-bt
enable_uart=1
```


## Adjusting the volume levels

Get a second HT and tune to an unused frequency like 144.200 or the like. With your handheld plugged into the TNC, key up. You should hear a tone on the second unit. You can adjust volume levels to the HT using R7. Use an output level slightly lower on the TNC than the volume output where your receiver no longer increases.


# --- STOP ---

Now is the time to reality check the project. You should be able to:

1. Key up on a connected HT to the TNC-Pi and hear a solid tone on another HT. **The tone should be full but not over-driven.**
2. Run `pitnc_getparams` to get current settings from your TNC.

In the next steps, we will configure the software to control the TNC. After that, we can setup our BBS. After this next section of software TNC control, you should be able to call _INTO_ BBS stations if you have any in your area. You will also be able to monitor traffic you send.


# Sending your first packet on the air

Our next step will involve sending and receiving a raw packet using the axcall tools and your HT. 

## Installing the tools for packet operation

You will need a few packages for this next step. Go ahead and run:

`sudo apt-get install ax25-tools ax25-apps telnet`

_Note: telnet is used for local testing of access to the BBS_


## Configuring axports to define devices/"services"

The /etc/ax25/axports file determines which interfaces are available to the rest of the AX 25 toolset, and therefore your BBS. Axports sets the values for the following (taken straight from Richard Osgood's [amazing guide](https://www.richardosgood.com/blog/how-to-setup-a-raspberry-pi-packet-radio-node-with-zork/) parameters.

If you add the (very sensible) line to the axports file: `0  CALLSIGN-N  19200  255  2  145.030 MHz (1200bps)`, you are telling the AX25 suite of tools the following:

- 0 - The name or number you assign to this device, used to reference in `kissattach` in a later step. In this example "0" is your device name.
- CALLSIGN-N – Callsign. The (-N) is a number suffix from 1 to 15, it is optional but if you run multiple devices your SSID (as this is called) will give you a way to distinguish each device you operate. X1ABC and X1ABC-5 represent the same licensed operator, but different devices. This is common if you run both PACTOR, BBS, APRS and other digital modes using the same callsign.
- 19200 – Baud rate of the device, NOT the protocol. 19200 baud is common for hardware TNCs unless otherwise listed.
- 255 – Packet length (paclen). The quantity of data you send with each transmission. 255 is generally a good balance between transmission speed and odds of a packet surviving the airwaves.
- 2 – Window. AX25 is a "GO BACK N" style of protocol with window size from 1 to 7 packets. Hyper-nerd warning: Feel free to read [this paper from the University of Bucharest](https://ftp.unpad.ac.id/orari/library/library-sw-hw/amateur-radio/packet-radio/simp.pdf) if you would like to learn more. 2 is a fine number.
- "145.030 MHz (1200bps)" – This is a text description of the device/service we are providing to the other AX25 tools.


## Attach an interface to the TNC device path

Now, we need to create an interface for our TNC. Running `sudo kissattach 0 /dev/ttyAMA0` will create one for you. Replace "0" with your device name from axports and "/dev/ttyAMA0" with your device path.


## Adjust volume settings and listen to packets

Turn on your HT and turn the volume to low. If you drive the speaker too hard, the receiver will overload and not decode your packets. I generally set mine at ~20% volume. Connect your serial to HT adapter at this time.

To listen to and decode packets, run `sudo axlisten -a` to listen and decode on all interfaces. the terminal will be blank until it receives packets over the air. To test this, tune to 144.390 and listen for ARS packets. The AX25 tools will be able to decode them. You could also use another transmitter and transmit packets over the speaker. Check the internet for example packet audio.

You should see the "RX" or "Decode" LED light up when your tnc decodes a packet.


## Run Axcall to test transmission

Transmit a packet by using `axcall 0 X1ABC`. The "0" is your interface name, the "X1ABC" is the station you are calling. This program automatically retries if it does not hear a response. Press Ctrl+C to kill the program. Test this by turning on another receiver and listening for the distinctive packet noise on the air. NOTE: For some reason, many TNCs get "stuck" and don't transmit on the first call. If you close (Ctrl+C) and retry `axcall`, it will generally work the second time.

You should see the "TX" LED light up on your tnc when packets are being sent. Additionally, if you run `axlisten` in a separate terminal, you should see your packets being sent.


# --- STOP ---

At this point you should be able to (1) Transmit a "Call" packet, (2) listen to and decode packets. If you have a BBS within range, you can use `axcall` to attempt to reach that board. In the next section, we will use the linbpq software to create a more user friendly BBS client as well as to host our BBS board.


## Installing LinBPQ

From [the documentation](http://www.cantab.net/users/john.wiseman/Documents/InstallingLINBPQ.htm), LINBPQ is a Linux version of the BPQ32 Node, BBS and Chat Server components. BPQ32 is a very commonly used and very in-depth application make by John Wiseman, G8BPQ. It is still in development as of March 31, 2020.

The official documentation on downloading the binary is great. Please [read the "Installation" section](http://www.cantab.net/users/john.wiseman/Documents/InstallingLINBPQ.htm) and follow along.

Next, we need to give linbpq a configuration to work from. While this file can be daunting, we are going to build up our station one feature at a time. First, we will enable telnet support and the management dashboard.


## Telnet and management dashboard setup

Here is the minimal `bpq32.cfg` file to run linbpq:

```
; Sample bpq32.cfg configuration by W1JWM
; Includes:
;   - Telnet, HTTP, TCP access for management
;   - KISS TNC Support

; Please see the full documentation for more details:
; http://www.cantab.net/users/john.wiseman/Documents/BPQCFGFile.html


; --- Begin required parameter section ---
LOCATOR=NONE ; Enable reporting to node map, or NONE
             ; http://www.cantab.net/users/john.wiseman/Documents/BPQNodeMap.htm
NODECALL=MYCALL ; Node callsign
NODEALIAS=ALIAS ; Alias 

; Message sent with station identification
IDMSG:
Network node (BPQ)
***

; Text sent in reply to "I" (info) message
INFOMSG:
MYCALL Test Swtich, My QTH
***

CTEXT:
MYCALL Test Switch
***

; You can also use the "SIMPLE" option to set many of these values automatically

BBS=1 ; This enables application support.
NODE=1 ; This allows users to connect to your node, and then connect out to other stations.
       ; If NODE=0, then uses will only be able to connect to your applications,
       ; and not to the node command handler.
ENABLE_LINKED=A ; Allow LINKED command use by gateway apps only
FULL_CTEXT=0 ; Send the full text to every user that connects, even stations making a jump
             ; Leave at 0 for forwarding compatibility
BTINTERVAL=60 ; Minutes between beacons are sent
BUFFERS=999 ; Number of packet buffers available. 999 = as many as possible (usually around 600)
C_IS_CHAT=1 ; Using "C" without a call opens chat
HIDENODES=0 ; Suppresses the display of NODES with an Alias that starts with a # sign.
IDINTERVAL=10 ; ID timing in minutes
IDLETIME=900 ; Idle link shutdown timer in seconds
L3TIMETOLIVE=25 ; Maximum Level 3 hops
L4DELAY=10 ; Level 4 Delayed ACK timer
L4RETRIES=3 ; Level 4 Retries
L4TIMEOUT=60 ; Level 4 Timeout
L4WINDOW=4 ; Level 4 Window
MAXCIRCUITS=128 ; Number of L4 Circults. Each connection through your node uses two L4 Circuit entries.
MAXNODES=250 ; Number of Nodes (L4 destinations)
MAXHOPS=4 ; Used for INP3 routing. The largest hop count to be added to your IMP3 routing table
MAXLINKS=64 ; Maximum Level 2 lines (Uplink, Downlink and Internode)
MAXROUTES=64 ; Number of adjacent Nodes
MAXRTT=90 ; Used for INP3 routing. The largest Round Trip Time to be added to your IMP3 routing table
MINQUAL=150 ; Minimum Quality to add to NODES table.
NODESINTERVAL=30 ; 'NODES' interval in minutes
OBSINIT=6 ; Initial obsolescence value
OBSMIN=5 ; Minimum to broadcast
PACLEN=236; Max packet size: PACLEN is a problem! The ideal size depends on the link(s) over
            ; which a packet will be sent.
AUTOSAVE=1 ; Causes the NODES and ROUTES tables to be saved to file BPQNODES.DAT when the switch closes.
SAVEMH=1 ; Tells Node to save and restore MH lists when shut down and restarted
T3=180 ; Link validation timer in seconds
; FULLCTEXT=1 ; Deprecated
; IPGATEWAY=0 ; Enable IP traffic over AX.25
; LINKEDFLAG='A' ; Deprecated
; --- End required parameter section ---
```

As you can see, there is a lot going on here. Please take the time to read the documentation, as the configuration options are endless. Make sure to replace MYCALL with your actual call sign. Next we will put in a section after the previous configuration section with a PORT definition for HTTP.

```
; --- Telnet, TCP, and HTTP port configuration ---
; Docs: http://www.cantab.net/users/john.wiseman/Documents/TelnetServer.htm
PORT
  ID=Telnet Server
  DRIVER=Telnet
  CONFIG ; Driver specific configuration, must come immediately before ENDPORT
    LOGGING=1 ; Enables logging of connections
    DisconnectOnClose=1 ; If set to 1, the telnet session will be disconnected
                        ; when the user leaves an application.
    TCPPORT=8010 ; The port users connect to for TELNET Sessions.
    FBBPORT=8011 ; FBBPORT is used for FBB forwarding, and other applications,
                 ; such as Winpack or BPQTermTCP that need a transparent TCP
                 ; connection rather than the full TELNET protocol.
    HTTPPORT=8080 ; The port users connect to for HTTP (Web) Sessions.
    LOGINPROMPT=user:
    PASSWORDPROMPT=password:
    MAXSESSIONS=10 ; The number of simultaneous sessions you want to allow
  
    CTEXT=Telnet access to server\nEnter ? for commands \n\n ; The text that a user is sent when connected.
    USER=John,PaSsWoRd,G8BPQ ; user,password,callsign,default-app,sysop
    USER=JohnBBS,password,g8bpq,BBS ; User and password are case sensitive. Call is converted to upper case
    USER=John,password,g8bpq,,SYSOP ; You can allow access to anyone not defined in a USER record by adding 
                                    ; the line USER=ANON,pass
    
    ; CMS=1 ; This provides a facility to send and receive messages to/from the WL2K CMS Servers
    ; CMSCALL=G8BPQ-10
    ; CMSPASS=XXXXXXX
ENDPORT
```

Now run `./linbpq` and the program will automatically grab this file and work to convert it. If you get a "Conversion (probably) successful" proceed to http://device-name.local:8080 where device-name is the name of your device (e.g. `raspberrypi`).

If you unzip the html files into a folder called "HTML" in the folder root, you will also get styled pages. You should have downloaded them in the [installation documentation](http://www.cantab.net/users/john.wiseman/Documents/InstallingLINBPQ.htm).


## Simple KISS Terminal configuration and radio interface

TODO


## BBS Mail configuration

TODO


## Other applications (CHAT, etc.)

TODO

