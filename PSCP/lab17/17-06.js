const redis = require("redis");

const client = redis.createClient("localhost:6379");

client.on('ready', () => console.log('ready'));
client.on('error', (err) => console.log('error: ', err));
client.on('connect', () => console.log('connected'));

let run = async () => {
    await client.connect();
    await client.subscribe('channel-1', (message) => {
        console.log(`message from channel-1: ${message}`);
    });

    setTimeout(async () => {
        await client.unsubscribe();
        client.quit();
    }, 20000);
}

run();
