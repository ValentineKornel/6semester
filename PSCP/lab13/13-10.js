const udp = require('dgram')

let PORT = '3000';
let client = udp.createSocket('udp4');
let buf = new Buffer.alloc(4);
let timerId = null;

client.on('message', (msg, info) => {

    console.log(`server message: ${msg.toString()}`);
    console.log(`read ${msg.length} bytes from ${info.address}:${info.port}`);
})

let data = Buffer.from('Message 01');
client.send(data, PORT, 'localhost', (err) => {
    if(err) client.close();
    else{console.log('Message sent to server');}
});

// let data1 = Buffer.from('Hello ');
// let data2 = Buffer.from('world');
// client.send([data1, data2], PORT, 'localhost', (err) => {
//     if(err) client.close();
//     else{console.log('Message sent to server');}
// });

setTimeout(() => {client.close()}, 3000);