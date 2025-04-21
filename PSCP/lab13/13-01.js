const net = require('net');

let HOST = '0.0.0.0';
let PORT = '4000';


net.createServer((sock) => {

    console.log(`Client connected ${sock.remoteAddress}:${sock.remotePort}`);

    sock.on('data', (data) => {
        console.log('client message: ' + data);
        sock.write("ECHO: " + data);
    });

    sock.on('close', () => {console.log(`Client disconnected ${sock.remoteAddress}:${sock.remotePort}`)});
}).listen(PORT, HOST);

