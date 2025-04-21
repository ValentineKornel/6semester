const rpcWSC = require('rpc-websockets').Client;


let client = new rpcWSC('ws://localhost:4000');




client.on('open', async() => {
    client.login({ login: 'user', password: '12345dfg' });

    client.call('square', [3]).then(r => console.log('square(3) = ', r));
    client.call('square', [5,4]).then(r => console.log('square(5,4) = ', r));
    client.call('sum', [2]).then(r => console.log('sum(2) = ', r));
    client.call('sum', [2,4,6,8,10]).then(r => console.log('sum(2,4,6,8,10) = ', r));
    client.call('mul', [3]).then(r => console.log('mul(3) = ', r));
    client.call('mul', [3,5,7,9,11,13]).then(r => console.log('mul(3,5,7,9,11,13) = ', r));
    client.call('fib', [1]).then(r => console.log('fib(1) = ', r));
    client.call('fib', [2]).then(r => console.log('fib(2) = ', r));
    client.call('fib', [7]).then(r => console.log('fib(7) = ', r));
    client.call('fact', [0]).then(r => console.log('fact(0) = ', r));
    client.call('fact', [5]).then(r => console.log('fact(5) = ', r));
    client.call('fact', [10]).then(r => console.log('fact(10) = ', r));

    client.close();
});

client.on('error', (e) => {console.log('error: ', e)});