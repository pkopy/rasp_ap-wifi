### Raspberry pi 3 B+ as Access Point and Wifi client

Okay, here is the method I used that worked for me. It is based on IOT wifi's solution, but I wanted to use a language other than Go to manage my wifi connections, so all changes are within the standard Raspbian Stretch OS.

These steps are (as best as I can remember) in the order that I did them in:

### Update system
Run apt-get update and upgrade to make sure you have the latest and greatest.
```

sudo apt-get update
sudo apt-get upgrade

```
###Install hostapd and dnsmasq
Install the hostapd access point daemon and the dnsmasq dhcp service.

```
sudo apt-get install hostapd dnsmasq
```

###Edit configuration files
Here we need to edit the config files for dhcpcd, hostapd, and dnsmasq so that they all play nice together. We do NOT, as in past implementations, make any edits to the /etc/network/interfaces file, since this can cause problems, per tutorial notes here: https://raspberrypi.stackexchange.com/questions/37920/how-do-i-set-up-networking-wifi-static-ip-address/37921#37921

#####Edit /etc/dhcpcd.conf

```
interface uap0
    static ip_address=192.168.4.1/24
    nohook wpa_supplicant
```

This sets up a static IP address on the uap0 interface that we will set up in the startup script. The nohook line prevents the 10-wpa-supplicant hook from running wpa-supplicant on this interface.
#####Replace /etc/dnsmasq.conf

Move the dnsmasq original file to save a copy of the quite useful example, you may even want to use some of the RPi-specific lines at the end. I did not test my solution with those.
```
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
```

#####Create a new /etc/dnsmasq.conf and add the following to it:
```
interface=lo,uap0               #Use interfaces lo and uap0
bind-interfaces                 #Bind to the interfaces
server=8.8.8.8                  #Forward DNS requests to Google DNS
domain-needed                   #Don't forward short names
bogus-priv                      #Never forward addresses in the non-routed address spaces
dhcp-range=192.168.4.2,192.168.4.150,24h
```

#####Create file /etc/hostapd/hostapd.conf and add the following:

```
# Set the channel (frequency) of the host access point
channel=1
# Set the SSID broadcast by your access point (replace with your own, of course)
ssid=yourSSIDhere
# This sets the passphrase for your access point (again, use your own)
wpa_passphrase=passwordBetween8and64charactersLong
# This is the name of the WiFi interface we configured above
interface=uap0
# Use the 2.4GHz band (I think you can use in ag mode to get the 5GHz band as well, but I have not tested this yet)
hw_mode=g
# Accept all MAC addresses
macaddr_acl=0
# Use WPA authentication
auth_algs=1
# Require clients to know the network name
ignore_broadcast_ssid=0
# Use WPA2
wpa=2
# Use a pre-shared key
wpa_key_mgmt=WPA-PSK
wpa_pairwise=TKIP
rsn_pairwise=CCMP
driver=nl80211
# I commented out the lines below in my implementation, but I kept them here for reference.
# Enable WMM
#wmm_enabled=1
# Enable 40MHz channels with 20ns guard interval
#ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]
```
Note: The channel written here MUST match the channel of the wifi that you connect to in client mode (via wpa-supplicant). If the channels for your AP and STA mode services do not match, then one or both of them will not run. This is because there is only one physical antenna. It cannot cover two channels at once.
#####Edit file /etc/default/hostapd and add the following over the #DAEMON_CONF line:
```
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```

### Create startup script

```bash
#!/bin/bash

# Redundant stops to make sure services are not running
echo "Stopping network services (if running)..."
systemctl stop hostapd.service
systemctl stop dnsmasq.service
systemctl stop dhcpcd.service

#Make sure no uap0 interface exists (this generates an error; we could probably use an if statement to check if it exists first)
echo "Removing uap0 interface..."
iw dev uap0 del

#Add uap0 interface (this is dependent on the wireless interface being called wlan0, which it may not be in Stretch)
echo "Adding uap0 interface..."
iw dev wlan0 interface add uap0 type __ap

#Modify iptables (these can probably be saved using iptables-persistent if desired)
echo "IPV4 forwarding: setting..."
sysctl net.ipv4.ip_forward=1
echo "Editing IP tables..."
iptables -t nat -A POSTROUTING -s 192.168.70.0/24 ! -d 192.168.70.0/24 -j MASQUERADE

# Bring up uap0 interface. Commented out line may be a possible alternative to using dhcpcd.conf to set up the IP address.
#ifconfig uap0 192.168.70.1 netmask 255.255.255.0 broadcast 192.168.70.255
ifconfig uap0 up

# Start hostapd. 10-second sleep avoids some race condition, apparently. It may not need to be that long. (?) 
echo "Starting hostapd service..."
systemctl start hostapd.service
sleep 10

#Start dhcpcd. Again, a 5-second sleep
echo "Starting dhcpcd service..."
systemctl start dhcpcd.service
sleep 5

echo "Starting dnsmasq service..."
systemctl start dnsmasq.service
echo "wifistart DONE"
```
There are other and better ways of automating this startup process, which I adapted from IOT wifi's code here: https://github.com/cjimti/iotwifi This demonstrates the basic functionality in a simple script.

###Edit rc.local system script
There are other ways of doing this, including creating a daemon that can be used by systemctl, which I would recommend doing if you want something that will restart if it fails. Adafruit has a simple write-up on that here: https://learn.adafruit.com/running-programs-automatically-on-your-tiny-computer/systemd-writing-and-enabling-a-service I used rc.local for simplicity here.


Add the following to your /etc/rc.local script above the exit 0 line (note the spacing between "/bin/bash" and "/usr/local/bin/wifistart"):

```
/bin/bash /usr/local/bin/wifistart
```
###Disable regular network services
The wifistart script handles starting up network services in a certain order and time frame. Disabling them here makes sure things are not run at system startup.

```
sudo systemctl stop hostapd
sudo systemctl stop dnsmasq
sudo systemctl stop dhcpcd
sudo systemctl disable hostapd
sudo systemctl disable dnsmasq
sudo systemctl disable dhcpcd
```

###Reboot
```
sudo reboot
```
If you want to test the code directly and view the output, just run

```
sudo /usr/local/bin/wifistart
```
