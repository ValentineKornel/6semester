const net = require('net');

let HOST = '127.0.0.1';
let PORT = '4000';


let client = new net.Socket();
let buf = new Buffer.alloc(4);
let timerId = null;

client.connect(process.argv[3], HOST, () => {
    console.log(`Connected to server ${client.remoteAddress}:${client.remotePort}`);
    
    timerId = setInterval(() => {
        client.write((buf.writeInt32LE(process.argv[2], 0), buf));
    }, 1000);
    setTimeout(() => {
        clearInterval(timerId);
        client.end();
    }, 20000);
});

client.on('data', (data) => {
    console.log('server message: ', data.toString());
})

client.on('close', () => console.log('Client closed'));
client.on('error', (err) => console.log('Client error:', err));