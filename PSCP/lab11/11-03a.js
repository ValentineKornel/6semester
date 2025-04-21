const WebSocket = require('ws');
const fs = require('fs');

let ws = new WebSocket('ws://localhost:4000/wsserver');

ws.on('open', () => {

    ws.on('message', (message) => {
        console.log(message.toString());
    })

    ws.on('ping', (data) => {console.log(data.toString());});

})
