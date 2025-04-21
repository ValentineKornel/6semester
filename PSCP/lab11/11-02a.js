const WebSocket = require('ws');
const fs = require('fs');

let ws = new WebSocket('ws://localhost:4000/wsserver');


ws.on('open', () => {

    const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let wfile = fs.createWriteStream('./MyFile2.txt');
    duplex.pipe(wfile);
    
})
