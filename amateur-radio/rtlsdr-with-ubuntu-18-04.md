## Getting the RTL-SDR Blog V.3 running on Ubuntu 18.04

To get the RTL-SDR Blog V.3 working, you need to address two specific quirks with running on Linux:

1. The selection of viable applications is limited
2. Most hardware used in modern SDRs are actually re-purposed chips from TV tuners

For the first issue, I would suggest using CubicSDR, downloadable from the [CubicSDR releases page](https://github.com/cjcliffe/CubicSDR/releases).

Download the `AppImage` file and open a terminal to where you downloaded the file. To run CubicSDR:

```
chmod +x CubicSDR-0.2.5-x86_64.AppImage  # Gives execute permissions
./CubicSDR-0.2.5-x86_64.AppImage         # Run the application
```

If when you go to run the application you get an error such as:

```
Kernel driver is active, or device is claimed by second instance of librtlsdr.
In the first case, please either detach or blacklist the kernel module (dvb_usb_rtl28xxu),
or enable automatic detaching at compile time.
```

... then CubicSDR cannot properly get control of the SDR chip. Newer versions of Ubuntu have pre-existing drivers which setup the SDR to decode TV signals, as the hardware was originally designed for that purpose. Therefore we need to:

1. Unload the modules related to TV watching
2. Prevent those modules from getting loaded automatically when the device is inserted

The modules of interest are `dvb_usb_rtl28xxu`, `dvb_usb_v2`, and `dvb_core`. To disable these modules and allow librtlsdr to work properly, first remove the SDR, then unload the modules with the following command:

```
sudo rmmod dvb_usb_rtl28xxu dvb_usb_v2 dvb_core`
```

Next, we can make sure they do not get loaded again when we plug the SDR back in by adding these lines to `/etc/modprobe.d/blacklist.conf`

```
# No need for TV tuning, I want to use my SDR
blacklist dvb_usb_rtl28xxu
blacklist dvb_usb_v2
blacklist dvb_core
```

Now, you can plug in your SDR and run CubicSDR. The DVB modules will not be loaded, leaving librtlsdr to be able to properly access the hardware.
