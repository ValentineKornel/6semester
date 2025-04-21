const net = require('net');

let HOST = '0.0.0.0';
let PORT = '4000';


let server = net.createServer();


server.on('connection', (sock) => {
    let sum = 0;
    console.log(`Client connected ${sock.remoteAddress}:${sock.remotePort}`);

    sock.on('data', (data) => {
        console.log(`client message: ${data.readInt32LE()}, sum: ${sum}`);
        sum += data.readInt32LE();
    });

    let buf = Buffer.alloc(4);
    setInterval(() => {
        buf.writeInt32LE(sum, 0);
        sock.write(buf);
    }, 5100);

    sock.on('close', () => {console.log(`Client disconnected ${sock.remoteAddress}:${sock.remotePort}`)});
    sock.on('error', (err) => {`socker error: ${err}`});

})
server.on('listening', () => console.log(`Server started ${HOST}:${PORT}`));
server.listen(PORT, HOST);

server.on('error', (err) => {`Server error: ${err}`});
