const net = require('net');

let HOST = '127.0.0.1';
let PORT = 4000;

let client = new net.Socket();
let buf = Buffer.alloc(4);
let timer = null;
client.connect(PORT, HOST, ()=>{
    let digit = parseInt(process.argv[2]);
    console.log(`Client CONNECTED ${client.remoteAddress}:${client.remotePort}`)
    timer = setInterval(() => {
        buf.writeInt32LE(digit);
        client.write(buf);
    }, 1000);

    setTimeout(()=>{
        clearInterval(timer);
        client.end();
    },21000)
})

client.on('data', data=>{
    console.log(`Client DATA: ${data.readInt32LE()}`);
})

client.on('close', ()=>{
    console.log('Client CLOSED');
})

client.on('error', (e)=>{
    console.log(e.message);
})