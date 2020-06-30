const express = require('express');
const path = require('path');
const app = express();
const test = require('./lib/Test')
const cors  =require('cors')
const url = require('url')
const { exec} = require('child_process')
const fs = require('fs')

app.use(cors())
app.use(express.static(path.join(__dirname, 'build')));
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.get('/findwifi', function(req, res) {
    	const q = url.parse(req.url, true).query
console.log(q)
	if (q.ssid && q.pass) {
        const network = `network={\n ssid=\"${q.ssid}\" \n psk=\"${q.pass}\"\n}`
        exec('cp /home/pi/Desktop/AP/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf', (err) => {
            if (err) {
				console.log(err)
			} else {
                fs.appendFile('/etc/wpa_supplicant/wpa_supplicant.conf', network, (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('Saved')
                        exec('sudo /usr/local/bin/wifistart.sh', (err) =>{
                            if (err) {
                                throw err
                            } 
                        }) 
                    }
                }) 
            }
        })
		
		
	} else if (q.clear === '0') {
console.log(q)
        exec('cp /home/pi/Desktop/AP/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf', (err) => {
            if (err) {
                console.log(err)
            } else {
                exec('sudo systemctl restart dhcpcd.service', (err) =>{
                    if (err) throw err
                })
            }
        })
        // console.log(q)
    }
	
    test()
        .then(data => {
            const payloadString = JSON.stringify(data)
             //console.log(data)
            res.writeHead(200, {
                'Content-Type': 'application/json'
            });
            res.end(payloadString)

        })
        .catch(err => console.log(err))
})

app.listen(80)


    
