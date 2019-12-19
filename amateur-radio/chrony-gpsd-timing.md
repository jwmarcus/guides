# Getting time from a USB GPS module

Following along with  [this guide](https://photobyte.org/raspberry-pi-stretch-gps-dongle-as-a-time-source-with-chrony-timedatectl/), we have these basic steps:

Install gps-daemon and supporting packages:

`sudo apt -y install gpsd gpsd-clients python-gps chrony`

Change your /etc/default/gpsd to auto-start, do autoUSB stuff, and give it the path to the device:

```
START_DAEMON=”true”

USBAUTO=”true”

DEVICES=”/dev/ttyACM0″

GPSD_OPTIONS=”-n”
```

Check for both services being active: 

```
systemctl is-active gpsd

systemctl is-active chronyd
```

Use `cgps –s` or `gpsmon -n` or `xgps` to make sure the GPS dongle works

Edit /etc/chrony/chrony.conf:

Add `refclock SHM 0 offset 0.5 delay 0.2 refid NMEA` to add the GPS as a ntp source

Optionally, turn off the pool ntp resource in this file to test it's working right

Check sources: `chronyc sources -v`

Detailed view: `sudo chronyc tracking`

Chrony slowly changes the time to avoid jitter, but you can force sync with `sudo chronyc makestep`
