const WebSocket = require('ws');
const fs = require('fs');

let ws = new WebSocket('ws://localhost:4000/wsserver');


ws.on('open', () => {

    const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let rfile = fs.createReadStream('./MyFile.txt');
    rfile.pipe(duplex);

    
})
