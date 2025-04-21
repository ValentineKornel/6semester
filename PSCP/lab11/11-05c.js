const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');

client.on('open', async () => {
    await client.login({ login: 'user', password: '12345' });

    let sum = async (params) => {
        let result = await client.call('sum', params);
        console.log(result);
        return result;
    };

    let square = async (params) => {
        let result = await client.call('square', params);
        console.log(result);
        return result;
    };

    let mul = async (params) => {
        let result = await client.call('mul', params);
        console.log(result);
        return result;
    };

    let fib = async (params) => {
        let result = await client.call('fib', params);
        console.log(result);
        return result;
    };

    let result = await (async () => {
        let squareResult = await square([3]);
        let squareResult2 = await square([5, 4]);
        let mulResult = await mul([3, 5, 7, 9, 11, 13]);
        let fibResult = await fib([7]);
        let mulResult2 = await mul([2, 4, 6]);

        let fibSumResult = await sum(fibResult);

        return (await sum([squareResult, squareResult2, mulResult])) + fibSumResult * mulResult2;
    })();

    console.log('result: ', result);

    client.close();
});

client.on('error', (e) => {console.log('error: ', e)});