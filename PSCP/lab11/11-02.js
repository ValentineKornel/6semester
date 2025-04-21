const WebSocket = require('ws');
const fs = require('fs');

let wsServer = new WebSocket.Server({port: 4000, host: 'localhost', path: '/wsserver'});


wsServer.on('connection', (ws) => {
    console.log(`new connection`);

    const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let rfile = fs.createReadStream('./download/MyFile.txt');
    rfile.pipe(duplex);

    ws.on('close', () => console.log('connection closed'));
})

wsServer.on('error', (e) => {console.log('ws server error ', e)});
console.log(`ws server: host: ${wsServer.options.host}, port: ${wsServer.options.port}, path: ${wsServer.options.path}`);