const redis = require("redis");

const client = redis.createClient("localhost:6379");

client.on('ready', () => console.log('ready'));
client.on('error', (err) => console.log('error: ', err));
client.on('connect', () => console.log('connected'));

let run = async () => {
    await client.connect();
}

run();


process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;

    while (inputBuffer.includes('\n')) {
        const lineEndIndex = inputBuffer.indexOf('\n');
        const line = inputBuffer.slice(0, lineEndIndex).trim();
        inputBuffer = inputBuffer.slice(lineEndIndex + 1);
        processCommand(line);
    }
});

async function processCommand(input){
    if(input === 'exit')
        client.quit();

    await client.publish('channel-1', input);
}

