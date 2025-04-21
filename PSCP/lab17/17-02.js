const redis = require("redis");
const { performance } = require("perf_hooks");

const client = redis.createClient("localhost:6379");

client.on('ready', () => console.log('ready'));
client.on('error', (err) => console.log('error: ', err));
client.on('connect', () => console.log('connected'));

let start;
let end;

let testSet = async () => {
    start = performance.now();
    for(i = 0; i < 10000; i++){
        await client.set(`key${i}`, i*2);
    }
    end = performance.now();
    console.log(`end set: ${end - start}ms`)
}
let testGet = async () => {
    let value;
    start = performance.now();
    for(i = 0; i < 10000; i++){
        value = await client.get(`key${i}`);
        // if(i % 1000 === 0)
        //     console.log(value);
    }
    end = performance.now();
    console.log(`end get: ${end - start}ms`)
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
    await testSet();
    await testGet();
    await testDel();
    client.quit();
}

run();