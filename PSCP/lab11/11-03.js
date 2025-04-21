const WebSocket = require('ws');
const fs = require('fs');

let wsServer = new WebSocket.Server({port: 4000, host: 'localhost'});

wsServer.on('connection', (ws) => {
    console.log(`new connection`);
    let n = 0;
    ws.isAlive = true;

    ws.on('pong', (data) => {
        console.log(data.toString());
        ws.isAlive = true;
    })

    let messageInterval = setInterval(() => {
        ws.send(`11-03-server: ${++n}`);
    }, 15000);

    ws.on('close', () => {
        console.log('connection closed');
        clearInterval(messageInterval);
    });
})

let pingInterva = setInterval(() => {
    wsServer.clients.forEach(ws => {
        if(!ws.isAlive){
            console.log('Terminationg inactive client');
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(`server: ping`);
    })

    let activeConnections = [...wsServer.clients].filter(ws => ws.readyState === WebSocket.OPEN).length;
    console.log(`Active connections amount: ${activeConnections}`);
}, 5000);

wsServer.on('close', () => {
    clearInterval(pingInterva);
})

wsServer.on('error', (e) => {console.log('ws server error ', e)});
console.log(`ws server: host: ${wsServer.options.host}, port: ${wsServer.options.port}, path: ${wsServer.options.path}`);