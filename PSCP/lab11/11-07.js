const rpcWSS = require('rpc-websockets').Server;

let server = new rpcWSS({port: 4000, host: 'localhost'});

server.register('A', (params) => {console.log('event A:', params)}).public();
server.register('B', (params) => {console.log('event B:', params)}).public();
server.register('C', (params) => {console.log('event C:', params)}).public();
