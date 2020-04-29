# Getting GPS and GPS timekeeping working on a raspberry pi

This guide assumes you are using a USB based GPS "mouse" or GPS "dongle" with a raspberry pi or similar Linux environment.

## Identify your device and create a udev rule

You can extract a list of basic information about your device using the `udevadm` command:

`udevadm info -a -p $(udevadm info -q path -n /dev/ttyUSB0)`

Change `ttyUSB0` to the path of your your GPS device. If in doubt, just unplug and run `ls /dev/*`, plug the device back in, and run again. You will notice a device see a device (/dev/ttyUSB*) pop back up. Once you find some unique characteristics of your GPS device, let's make a symlink via a udev rule to something we can reference consistently after each boot. 

I used the vendor ID, product ID, and subsystem to narrow down a udev rule for this device. Add the following to your `/etc/udev/rules.d/10-local.rules` file:

```
ACTION=="add", ATTRS{idVendor}=="067b", ATTRS{idProduct}=="2303", SUBSYSTEM=="tty", SYMLINK+="gps0"
```

You can verify the udev rules took effect if you see a device at `/dev/gps0` after rebooting and plugging in the GPS module.

## Install GPS utilities

Once you have your GPS at a determined location install the GPS utilities:

`sudo apt-get install gpsd gpsd-clients python-gps`

Per this [Dragino guide](https://wiki.dragino.com/index.php?title=Getting_GPS_to_work_on_Raspberry_Pi_3_Model_B), you will need to stop and disable GPSD to test it manually:

```
sudo systemctl stop gpsd.socket
sudo systemctl disable gpsd.socket
```

Now let's manually put up the gpsd interface and point it at our newly symlinked GPS path:

`sudo gpsd /dev/gps0 -F /var/run/gpsd.sock`

You should now be able to run `cgps -s` and see the current status of satelite acquisition. Note: you will need to be outside to get this to work. Put on your sunscreen and face the day-star at this point.

If you are correctly identifying the GPS, kill GPSD and edit the `/etc/default/gpsd` file so it reads from the correct location on system start:

```
START_DAEMON="true"
GPSD_OPTIONS="-n"
DEVICES="/dev/gps0"
USBAUTO="false"
GPSD_SOCKET="/var/run/gpsd.sock"
```

Now `sudo killall gpsd` and re-enable the service:

```
sudo systemctl start gpsd.socket
sudo systemctl enable gpsd.socket
```

## Getting the time server running off GPS

Install the required packages to manage the GPS as a NTP source:

`sudo apt -y install python-gps chrony python-gi-cairo`

If you are connected to a network, the command `chronyx sources -v` should give you a list of available, internet-based, time sources.

Let's add the NMEA data source (from the GPS data stream) to our list. Append this in `/etc/chrony/chrony.conf` at the end:

`refclock SHM 0 offset 0.5 delay 0.2 refid NMEA`

You can also uncomment this line to read the logs at `/var/log/chrony`:

```
# Uncomment the following line to turn logging on.
log tracking measurements statistics
```

Restart the service with `sudo systemctl restart chronyd` and recheck the chrony sources again with `chronyc sources -v`. You should see something like:


  MS Name/IP address         Stratum Poll Reach LastRx Last sample
  ===============================================================================
  #? NMEA                          0   4     3    19   +350ms[ +350ms] +/-  161ms
  ^? mortified-chicken.square>     0   6     0     -     +0ns[   +0ns] +/-    0ns


From this [Protobyte article](https://photobyte.org/raspberry-pi-stretch-gps-dongle-as-a-time-source-with-chrony-timedatectl/) what we are seeing is: 

```
If you are connected to the network, you will see a list of available time servers plus the GPS source which will be shown as NMEA. If you’re not network connected, you will just see the NMEA source listed. The two punctuation characters immediately before NMEA, indicate its status and you need to see #* where # means thge GPS is recognised as a local clock and * means that it’s being used to synchronise the Pi system time.
```

Using `sudo chronyc tracking` will show you a more detailed display of information.

If you want to force a clock update, use `sudo chronyc makestep` and it will force a hard clock update. Otherwise, chrony will slowly drift the system clock to match the preferred NTP server time.

If you would like to test this setup out *without* the use of the internet (but still need to ssh into your raspberry pi), try commenting out the **pool** line in your /etc/chrony/chrony.conf file. You may need to reboot to clear the internet based sources. A GPS only sources output will look like:

  MS Name/IP address         Stratum Poll Reach LastRx Last sample               
  ===============================================================================
  #* NMEA                          0   4   377    23  -9721us[  -12ms] +/-  160ms

