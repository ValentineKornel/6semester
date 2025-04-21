const rpcWSS = require('rpc-websockets').Server;

let server = new rpcWSS({port: 4000, host: 'localhost'});

server.event('A');
server.event('B');
server.event('C');


process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;

    while (inputBuffer.includes('\n')) {
        const lineEndIndex = inputBuffer.indexOf('\n');
        const line = inputBuffer.slice(0, lineEndIndex).trim(); // Извлекаем строку
        inputBuffer = inputBuffer.slice(lineEndIndex + 1); // Убираем обработанную строку из буфера
        processCommand(line);
    }
});

function processCommand(input){
    let event = input;

    switch(event){
        case('A'):{
            server.emit('A', 'event A occured');
            break;
        }
        case('B'):{
            server.emit('B', 'event B occured');
            break;
        }
        case('C'):{
            server.emit('C', 'event C occured');
            break;
        }
        default:{
            console.log('Not a command');
        } break;
    }
}



