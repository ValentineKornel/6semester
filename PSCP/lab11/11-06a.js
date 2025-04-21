const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {

    client.subscribe('A');

    client.on('A', (m) => console.log('event A: ', m));
})