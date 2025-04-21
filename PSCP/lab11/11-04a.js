const WebSocket = require('ws');

let parm2 = process.argv[2];

let clientName = parm2 === 'undefined' ? 'defauld client' : parm2;

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
    
    let intervalId = setInterval(() => {
        ws.send(JSON.stringify({client: clientName, timestamp: new Date().toISOString()}));
    }, 3000);

    ws.on('message', (message) => {
        console.log('Received message', JSON.parse(message));
    })

    setTimeout(() => {
        clearInterval(intervalId);
        ws.close();
    }, 25000);
})
