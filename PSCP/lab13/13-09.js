const udp = require('dgram');

let PORT = '3000';

let server = udp.createSocket('udp4');


server.on('message', (msg, info) => {

    console.log(`client message: ${msg.toString()}`);
    console.log(`read ${msg.length} bytes from ${info.address}:${info.port}`);

    server.send(`ECHO: ${msg.toString()}`, info.port, info.address, (err) => {
        if(err) server.close();
        else{console.log('data sent to client');}
    })

})
server.on('listening', () => console.log(`Server started ${server.address().address}:${server.address().port}, family: ${server.address().family}`));
server.bind(PORT);

server.on('error', (err) => {`Server error: ${err}`});

//setTimeout(() => {server.close()}, 10000);

