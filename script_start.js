const fs = require('fs')
const { exec } = require('child_process')


fs.open('test.txt', 'r', (err, file) => {
    if (err) {
        throw err
    } else {
        console.log(file)
        myData('test.txt')
            .then(data => {
                if (data.AP) {
                    console.log('ok')
                    
                } else {
                    scanWifi()
                        .then(data => {
                            console.log(data)
                            if (data.length > 0) {
                                const obj = {AP: true, data:data, network:{"ssid":"", "psk":""}}
                                fs.writeFile('test.txt', JSON.stringify(obj), (err) => {
                                    if (err) {
                                        console.log(err)

                                    } else {
                                        console.log('Saved!');
                                    }
                                })

                            } else {
                                console.log('Could not find any networks')
                            }
                        })
                        .catch(err => console.log(err))
                    console.log('hhhhhhhhhhhhhh')
                }
            })
            .catch(err => console.log(err))
        
    }
})


const scanWifi = () => {
    return new Promise((res, rej) => {
        exec('iwlist scan', (err,stdout, stderr) => {
            if (err) {
                rej(err)
            } else {
                const wifi = stdout.split('ESSID:');
                const address = stdout.split('Address:')
                let arr = []
                for (let i = 0; i < wifi.length; i++) {
                    arr.push({SSID:wifi[i].substring(1, wifi[i].indexOf('\"',1)), Address: address[i].substring(1,18)})
                }

                res(arr)
            }
        })
    })
}

const myData = (file) => {
    return new Promise((res,rej) => {
        fs.readFile(file, (err, data) => {
            if (err) {
                rej(err)
            } else {
                // console.log(JSON.parse(data.toString()))
                try {
                    res(JSON.parse(data.toString()))
                } catch {
                    rej('iiiiiiiii' )

                }

            }
        })

    })
}