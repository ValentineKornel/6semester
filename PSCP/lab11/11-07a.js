const rpcWSC = require('rpc-websockets').Client;

let client = new rpcWSC('ws://localhost:4000');

process.stdin.resume();
process.stdin.setEncoding('utf8');

client.on('open', () => {
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
});

function processCommand(input){
    let event = input;

    switch(event){
        case('A'):{
            client.notify('A', {m: 'event A occured'});
            break;
        }
        case('B'):{
            client.notify('B', {m: 'event B occured'});
            break;
        }
        case('C'):{
            client.notify('C', {m: 'event C occured'});
            break;
        }
        case('exit'):{
            client.close();
            process.exit(0);
        }
        default:{
            console.log('Not a command');
        } break;
    }
}