const { exec } = require('child_process')
const fs = require('fs')

async function wlan() {
    let arr = []
    const reg = /[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}/
    const netInfo = {}
    await test('iwlist wlan0 scan').then(wifi => {
        const wifi1 = wifi.split('ESSID:')
        const address = wifi.split('Address:')
        // let arr = []				
        for (let i = 0; i < wifi1.length; i++) {
            arr.push({ SSID: wifi1[i].substring(1, wifi1[i].indexOf('\"', 1)), Address: address[i].substring(1, 18) })
        }
    }).catch(() => [])
    await test('iwconfig wlan0 | grep ESSID:').then(data => {
        const wifiName = data.split('ESSID:')[1].trim()
        netInfo.wifiName =  wifiName.substring(1,wifiName.length-1)
    }).catch(() => {
        netInfo.wifiName = 'No network'
    })

    await test('ifconfig wlan0 | grep -m1 inet').then(data => {
       netInfo.wlan = reg.exec(data.trim())
    }).catch(() => {
        netInfo.wlan = '0.0.0.0'
    })
    await test('ifconfig eth0 | grep -m1 inet').then(data => {
        netInfo.eth = reg.exec(data.trim())
    }).catch(() => {
        netInfo.eth ='0.0.0.0' 
    })
    arr.push(netInfo)
    console.log('arrat:',arr)
    return arr


    // return new Promise((res, rej) => {

    // exec('iwlist wlan0 scan', (err, stdout, stderr) => {
    // 	if (err) {
    // 		rej(err)
    // 	} else {
    // 		//console.log(stdout)
    // 		const wifi = stdout.split('ESSID:')
    // 		const address = stdout.split('Address:')
    // 		let arr = []				
    // 		for (let i =0; i < wifi.length; i++) {
    // 			arr.push({SSID:wifi[i].substring(1, wifi[i].indexOf('\"',1)), Address:address[i].substring(1,18)})
    // 		}
    // 		//console.log(arr)
    // 		//res(stdout.split('-'))
    // 		exec('iwconfig wlan0 | grep ESSID:', (err, stdout, stderr) => {
    // 			if (err) {
    // 				console.log(err)
    // 			} else {
    // 				const wifiName = stdout.split('ESSID:')[1].trim()
    // 				exec('ifconfig wlan0 | grep -m1 inet', (err, stdout,stderr) => {
    // 					if (err) {
    // 						console.log(err)
    // 						arr.push('wlan 0.0.0.0')
    // 						arr.push(wifiName.substring(1,wifiName.length-1))
    // 						res(arr)
    // 					} else {
    // 						//console.log(stdout.split('\s'))
    // 						arr.push(stdout.trim())
    //                         // arr.push(wifiName.substring(1,wifiName.length-1))
    //                         exec('ifconfig eth0 | grep -m1 inet', (err, stdout,stderr) => {
    //                             if (err) {
    //                                 arr.push('eth 0.0.0.0')
    //                                 arr.push(wifiName.substring(1,wifiName.length-1))
    //                                 res(arr)
    //                             } else {
    //                                 arr.push(stdout.trim())
    //                                 arr.push(wifiName.substring(1,wifiName.length-1))
    //                                 res(arr)
    //                             }
    //                         })

    // 					}
    // 				})

    // 			}
    // 		})
    // 		//res(arr)
    // 	}
    // })

    // })


}

function test(command) {
    return new Promise((res, rej) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.log(err)
                rej(err)
            } else {
                res(stdout)
            }
        })
    })
}

module.exports = wlan