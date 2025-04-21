const redis = require("redis");
const { performance } = require("perf_hooks");

const client = redis.createClient("localhost:6379");

client.on('ready', () => console.log('ready'));
client.on('error', (err) => console.log('error: ', err));
client.on('connect', () => console.log('connected'));

let start;
let end;

let testHSet = async () => {
    start = performance.now();
    for(i = 0; i < 10000; i++){
        await client.hSet(`key${i}`, {value1: i+1, value2: i+3, value4: i+4});
    }
    end = performance.now();
    console.log(`end hset: ${end - start}ms`)
}
let testHGet = async () => {
    let value;
    start = performance.now();
    for(i = 0; i < 10000; i++){
        value = await client.hGetAll(`key${i}`);
    }
    end = performance.now();
    console.log(`end hget: ${end - start}ms`)
}
let testDel = async () => {
    start = performance.now();
    for(i = 0; i < 10000; i++){
        await client.del(`key${i}`);
    }
    end = performance.now();
    console.log(`end del: ${end - start}ms`)
}

let run = async () => {
    await client.connect();
    await testHSet();
    await testHGet();
    await testDel();
    client.quit();
}

run();