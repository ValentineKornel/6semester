const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {

    client.subscribe('C');

    client.on('C', (m) => console.log('event C: ', m));
})