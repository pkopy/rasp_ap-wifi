const fs = require('fs')
const {exec} = require('child_process')

const check = () => {
    // setInterval(() => {
    //     console.log('test')
    // }, 1000)

    fs.watchFile('./lib/test.txt', (cur, prev) => {
        console.log(cur)
        exec('sudo x-www-browser http://127.0.0.1:4500', (err) => {
            if(!err) {
                console.log(err)
            }
        })
    })
}
module.exports = check
