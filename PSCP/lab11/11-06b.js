const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {

    client.subscribe('B');

    client.on('B', (m) => console.log('event B: ', m));
})