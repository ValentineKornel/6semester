const WebSocket = require('ws');
let wsServer = new WebSocket.Server({port: 4000, host: 'localhost'});


wsServer.on('connection', (ws) => {
    console.log(`new connection`);
    let n = 0;

    ws.on('message', (message) => {
        let messageObj = JSON.parse(message);
        console.log('Received message:', messageObj);
        
        ws.send(JSON.stringify({server: ++n, client: messageObj.client, timestamp: new Date().toISOString()}));
    })

    ws.on('close', () => console.log('connection closed'));
})

wsServer.on('error', (e) => {console.log('ws server error ', e)});
console.log(`ws server: host: ${wsServer.options.host}, port: ${wsServer.options.port}, path: ${wsServer.options.path}`);