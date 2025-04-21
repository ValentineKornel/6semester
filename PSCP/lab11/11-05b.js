const async = require('async');
const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');


let startFunction =(x=client) => async.parallel({
    square1: (cb) => client.call('square', [3]).catch(e => cb(e, null)).then(r => cb(null, r)),
    square2: (cb) => client.call('square', [5,4]).catch(e => cb(e, null)).then(r => cb(null, r)),
    sum1: (cb) => client.call('sum', [2]).catch(e => cb(e, null)).then(r => cb(null, r)),
    sum2: (cb) => client.call('sum', [2,4,6,8,10]).catch(e => cb(e, null)).then(r => cb(null, r)),
    mul1: (cb) => client.call('mul', [3]).catch(e => cb(e, null)).then(r => cb(null, r)),
    mul2: (cb) => client.call('mul', [3,5,7,9,11,13]).catch(e => cb(e, null)).then(r => cb(null, r)),
    fib1: (cb) => client.call('fib', [1]).catch(e => cb(e, null)).then(r => cb(null, r)),
    fib2: (cb) => client.call('fib', [2]).catch(e => cb(e, null)).then(r => cb(null, r)),
    fib3: (cb) => client.call('fib', [7]).catch(e => cb(e, null)).then(r => cb(null, r)),
    fact1: (cb) => client.call('fact', [0]).catch(e => cb(e, null)).then(r => cb(null, r)),
    fact2: (cb) => client.call('fact', [5]).catch(e => cb(e, null)).then(r => cb(null, r)),
    fact3: (cb) => client.call('fact', [10]).catch(e => cb(e, null)).then(r => cb(null, r)),
    },
    (e,r) =>{
        if(e) console.log('error: ', e);
        else console.log('result: ', r);
        client.close();
    }
);

client.on('open', async () => {
    await client.login({ login: 'user', password: '12345' });
    startFunction();
});

client.on('error', (e) => {console.log('error: ', e)});