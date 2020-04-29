# Setting udev rules for the Yaesu FT-891

The Yaesu FT-891 HF amateur radio provides two interfaces when plugged into a computer via USB. Like any other device, when adding various devices to the raspberry pi via USB, you never really know which path you'll be assigned. Instead of guessing (out in the rain / in the field) which device was mapped to which path, we create a new rule file in `/etc/udev/rules.d/10-local.rules`:

## Why write a udev rule

Many amateur radio applications require basic information like post number or path to access hf devices like sound cards and transceivers. A major annoyance of mine is that every time I boot up my computer (in my case a raspberry pi that travels with my field station) I get randomly assigned paths for each device. This means that I potentially have to reconfigure all my software every time I re-power the system. Using the udev subsystem gives up the ability to map an symlink for each device, specified by more specific hardware information such as device id or manufacturer id, to put each device at the same path each time. 

I use this method for both assigning a `/dev/hfrig0` path for my FT-891 and a `/dev/gps0` path for my GPS dongle, which keeps track of time for modes like FT8. Here is the udev rule I settled on for my FT-891:

```
ACTION=="add", SUBSYSTEM=="tty", SUBSYSTEMS=="usb", KERNELS=="1-1.3:1.0", SYMLINK+="hfrig0"
```

Udev rules are based on *matching* attributes of devices added or removed from the system. The *ACTION* value tells us to listen to "add" actions. *SUBSYSTEM* is the device subsystem, and so on. I used the *KERNELS* parameter as the FT-891 puts up TWO identical interfaces, of which one is the standard port, and the other enhanced (which also includes cat/rig control). One downside to the "1-1.3:1.0" value is that I **MUST** plug the FT-891 into the same position on the raspberry pi every time. Again, because all other parameters on each of the two interfaces are identical, I had to use the ":1.0" portion of the KERNELS parameter.

If you are looking to get the information about your radio or other device, run: `udevadm info -a -p $(udevadm info -q path -n /dev/ttyUSB0)` and replace `ttyUSB0` with your device of choice. Plugging in and unplugging the device will tell you where the device got a path to by comparing `ls -l /dev/*` before and after unplugging and plugging back in.

I HIGHLY suggest reading the documentation for the udev subsystem. Aside from creating symlinks for unruly ham radio devices you can also execute scripts at plug-in time.

