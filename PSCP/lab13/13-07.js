const net = require('net');

let HOST = '0.0.0.0';
let PORT1 = '4000';
let PORT2 = '5000';

let h = (n) => { return (sock) => {
    console.log(`Client connected ${sock.remoteAddress}:${sock.remotePort}`);

    sock.on('data', (data) => {
        let num = 
        console.log(`client message ${n}: ${data.readInt32LE()}`);
        sock.write(`ECHO ${n}:` + data.readInt32LE().toString());
    });

    sock.on('close', () => {console.log(`Client disconnected ${sock.remoteAddress}:${sock.remotePort}`)});
    sock.on('error', (err) => {`socker error: ${err}`});

}
}
net.createServer(h(PORT1)).listen(PORT1, HOST).on('listening', () => console.log(`Server started ${HOST}:${PORT1}`));
net.createServer(h(PORT2)).listen(PORT2, HOST).on('listening', () => console.log(`Server started ${HOST}:${PORT2}`));

