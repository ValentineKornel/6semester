const redis = require("redis");
const { performance } = require("perf_hooks");

const client = redis.createClient("localhost:6379");

client.on('ready', () => console.log('ready'));
client.on('error', (err) => console.log('error: ', err));
client.on('connect', () => console.log('connected'));

let start;
let end;


let testIncr = async () => {
    await client.set('incr', 0);

    start = performance.now();
    for(i = 0; i < 10000; i++){
        await client.incr('incr');
    }
    end = performance.now();
    console.log(`end incr: ${end - start}ms`)

    await client.del('incr');
}

let testDecr = async () => {
    await client.set('decr', 10000);

    start = performance.now();
    for(i = 0; i < 10000; i++){
        await client.decr('decr');
    }
    end = performance.now();
    console.log(`end decr: ${end - start}ms`)

    await client.del('decr');
}

let run = async () => {
    await client.connect();
    await testIncr();
    await testDecr();
    client.quit();
}

run();