const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');

client.on('open', () => {

    client.subscribe('backupChange');

    client.on('backupChange', (m) => console.log('Notification: ', m));
})