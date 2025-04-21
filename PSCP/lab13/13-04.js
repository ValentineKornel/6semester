const net = require('net');

let HOST = '127.0.0.1';
let PORT = '4000';


let client = new net.Socket();
let buf = new Buffer.alloc(4);
let timerId = null;


client.connect(PORT, HOST, () => {
    console.log(`Connected to server ${client.remoteAddress}:${client.remotePort}`);
    
    let k = 0;
    timerId = setInterval(() => {
        client.write((buf.writeInt32LE(5, 0), buf));
    }, 1000);
    setTimeout(() => {
        clearInterval(timerId);
        client.end();
    }, 21000);
});

client.on('data', (data) => {
    console.log('server message: ', data.readInt32LE());
})

client.on('close', () => console.log('Client closed'));
client.on('error', (err) => console.log('Client error:', err));