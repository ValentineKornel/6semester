const rpcWSS = require('rpc-websockets').Server;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let server = new rpcWSS({port: 4000, host: 'localhost'});

const AUTH_USER = 'user';
const AUTH_PASS = '12345';

server.setAuth((credentials) => {
    return credentials.login === AUTH_USER && credentials.password === AUTH_PASS;
})

server.register('square', async (params) => {
    await sleep(100);
    if (params.length === 1) {
        //S = π * r^2
        let r = params[0];
        return Math.PI * Math.pow(r, 2);
    } else if (params.length === 2) {
        let [a, b] = params;
        return a * b;
    } else {
        return -1;
    }
}).public;

server.register('sum', (params) => {
    let res = 0;
    for(i = 0; i < params.length; i++){
        res += params[i];
    }
    return res;
}).public;

server.register('mul', (params) => {
    let res = 1;
    for(i = 0; i < params.length; i++){
        res *= params[i];
    }
    return res;
}).public;

server.register('fib', (params) => {
    const n = params[0];
    if (n <= 0) {
        return [];
    }
    const fibSequence = [0, 1];

    for (let i = 2; i < n; i++) {
        fibSequence.push(fibSequence[i - 1] + fibSequence[i - 2]);
    }
    return fibSequence.slice(0, n);
}).protected;

server.register('fact', (params) => {
    const n = params[0]; 
    if (n < 0) {    
        return 0;
    }
    let result = 1;

    for (let i = 1; i <= n; i++) {
        result *= i;
    }
    return result;
}).protected;

