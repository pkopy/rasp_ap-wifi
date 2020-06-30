const tab = [" 01 - Address: 8A:8A:20:8D:A0:E7",
"                    ESSID:'RADWAG_PRODUKCJA'",
 "                    Protocol:IEEE 802.11bgn",
"                    Mode:Master",
"                    Frequency:2.412 GHz (Channel 1)",
"                    Encryption key:on",
"                    Bit Rates:144 Mb/s",
"                    Extra:rsn_ie=30140100000fac040100000fac040100000fac020000",
"                    IE: IEEE 802.11i/WPA2 Version 1",
"                        Group Cipher : CCMP",
"                        Pairwise Ciphers (1) : CCMP",
"                        Authentication Suites (1) : PSK",
"                    Quality=0/100  Signal level=84/100  ",
"          "]

const arr = []
for (let i = 1; i < tab.length; i++) {
    const elem = tab[i].trim().split(':')
    if (elem.length > 1) {
        const name = elem[0].trim()
        const value = elem[1].trim()
        const obj = {}
        obj[name] = value
        arr.push(obj)

    }
}

console.log(arr)