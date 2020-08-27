const express = require('express');
const path = require('path');
const app = express();
const findAdrr = require('./lib/FindAdrr')
const cors = require('cors')
const url = require('url')
const {exec} = require('child_process')
const fs = require('fs')
const check = require('./lib/dhcpChecker')

app.use(cors())

app.get('/', function (req, res) {
//console.log(req)
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        (req.connection.socket ? req.connection.socket.remoteAddress : null);
    console.log('ip:', ip)

    if (ip.indexOf('192.168.10') < 0) {
        app.use(express.static(path.join(__dirname, 'build')));
        res.sendFile(path.join(__dirname, 'build', 'index.html'))
    } else {
        app.use(express.static(path.join(__dirname, 'build-ap')));
        res.sendFile(path.join(__dirname, 'build-ap', 'index.html'))
    }
    ;
});

app.get('/', function (req, res) {
    console.log(req)
})
app.get('/reset', (res,rej) => {
    exec('sudo /usr/local/bin/wifistart.sh', (err) =>{
        if (err === 'EADDRINUSE') {
            console.log('restart ')
        } else if (err) {
            throw err
        } else {
            console.log('OK')
        }
    })
})
app.get('/findwifi', function (req, res) {
    const q = url.parse(req.url, true).query
//console.log(q)
    if (q.ssid && q.pass) {
        const network = `network={\n ssid=\"${q.ssid}\" \n psk=\"${q.pass}\"\n}`
        //path.join(__dirname, 'wpa_supplicant.conf')
        exec('cp /home/pi/ftp/files/e2r/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf', (err) => {
            if (err) {
                console.log(err)
            } else {
                fs.appendFile('/etc/wpa_supplicant/wpa_supplicant.conf', network, (err) => {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log('Saved')
                        exec('sudo systemctl restart dhcpcd.service', (err) => {
                            if (err) {
                                throw err
                            } else {

                                console.log('DHCP RESTART DONE')
                                res.end('DHCP RESTART DONE')
                            }
                        })
                        // exec('sudo /usr/local/bin/wifistart.sh', (err) =>{
                        //     if (err === 'EADDRINUSE') {
                        //         console.log('restart ')
                        //     } else if (err) {
                        //         throw err
                        //     } else {
                        //         console.log('OK')
                        //     }
                        // })
                    }
                })
            }
        })


    } else if (q.clear === '0') {
        console.log(q)
        exec('cp ./wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf', (err) => {
            if (err) {
                console.log(err)
            } else {
                exec('sudo systemctl restart dhcpcd.service', (err) => {
                    if (err) {
                        throw err
                    } else {
                        console.log('DHCP RESTART DONE')
                        res.end('DHCP RESTART DONE')
                    }
                })
            }
        })
        // console.log(q)
    }

    findAdrr()
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
try {
    app.listen(4500)
    // check()
} catch {
    console.log('Server already exist')
}

