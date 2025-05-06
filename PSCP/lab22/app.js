const express = require('express');
const fs = require('fs');
const https = require('https');

let options = {
    key: fs.readFileSync('./LAB-KVV.key').toString(),
    cert: fs.readFileSync('./LAB-KVV.crt').toString(),
    passphrase: 'korneliuk'
}

const app = express();

https.createServer(options, app).listen(3443);

app.get('/', (req, res) => {
    res.end('Hello from https');
})
