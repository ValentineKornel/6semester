const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createCanvas } = require('canvas');

let server;


function NOD(a, b) {
    while (b !== 0) {
        [a, b] = [b, a % b];
    }
    return Math.abs(a);
}

function NODMultiple(...numbers) {
    if (numbers.length < 2) {
        throw new Error("At least two number is required");
    }
    
    let result = numbers[0];
    for (let i = 1; i < numbers.length; i++) {
        result = NOD(result, numbers[i]);
    }
    
    return result;
}

function findPrimesInRange(start, end) {
    const primes = [];
    
    for (let num = Math.max(2, start); num <= end; num++) {
        let isPrime = true;
        for (let i = 2; i * i <= num; i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(num);
        }
    }
    return primes;
}

function isPrimeFerm(number){
    if((Math.pow(2, number-1)) % number != 1) return false
    return true
}

console.log("167 Ferm: ", isPrimeFerm(167));

function isPrime(number){
        for (let i = 2; i * i <= number; i++) {
            if (number % i === 0) {
                return false;
            }
        }
        return true;
}
console.log("167: ", isPrime(167));
console.log(`\nIs 399433 prime: ${isPrime(399433)}\n`);

console.log(NODMultiple(48, 18, 30));
console.log(findPrimesInRange(2, 433).length);

server = http.createServer(function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/' && req.method == 'GET'){

        resp.writeHead(200, {'Content-Type': 'text/html'});
        resp.end(
            `
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Формы для отправки чисел</title>
                <style>
                    body { font-family: Arial, sans-serif; }
                    form { margin-bottom: 20px; }
                    input, button { margin: 5px; padding: 8px; }
                    #result1, { margin-top: 10px; font-weight: bold; }

                     .array-output {
                        width: 1490px; /* Ограничиваем ширину контейнера */
                        height: auto;
                        word-wrap: break-word; /* Перенос слов при необходимости */
                        overflow-wrap: break-word; /* Дополнительная поддержка для старых браузеров */
                        padding: 10px;
                        white-space: pre-wrap; /* Сохраняем пробелы и переносим строки */
                    }
                </style>
            </head>
            <body>

                <div class="container">
                    <div>
                    Простые числа в интервале [2, 433]: <div class="array-output">${findPrimesInRange(2, 433)}</div>
                    
                    Предпологаемое количество простых чисел n/ln(n):71,3, реальное количество простых чисел: 84
                    </div><br>
                    <div>
                    Простые числа в интервале [399, 433]: ${findPrimesInRange(399, 433)}
                    </div>
                </div>

                <h2>Найти НОД чисел</h2>
                <form id="formNumbers">
                    <label>Введите числа через запятую:</label><br>
                    <input type="text" id="numbersInput" required>
                    <button type="submit">Отправить</button>
                </form>
                <div id="result1"></div>

                <h2>Найти простые числа в промежутке</h2>
                <form id="formRange">
                    <label>Введите диапазон (два числа):</label><br>
                    <input type="number" id="startNumber" required> -
                    <input type="number" id="endNumber" required>
                    <button type="submit">Отправить</button>
                </form>
                <div class="array-output" id="result2"></div>

                <script>
                    document.getElementById("formNumbers").addEventListener("submit", async function(event) {
                        event.preventDefault();
                        let numbers = document.getElementById("numbersInput").value;

                        let response = await fetch("http://localhost:5000/NOD", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ numbers })
                        });

                        let result = await response.text();
                        document.getElementById("result1").innerText = "Ответ: " + result;
                    });

                    document.getElementById("formRange").addEventListener("submit", async function(event) {
                        event.preventDefault();
                        let start = document.getElementById("startNumber").value;
                        let end = document.getElementById("endNumber").value;

                        let response = await fetch("http://localhost:5000/primes", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ start, end })
                        });

                        let result = await response.text();
                        document.getElementById("result2").innerText = "Ответ: " + result;
                    });
                </script>

            </body>
            </html>
            `
        );
    }
    else if(pathName == '/NOD' && req.method == 'POST'){
        let data = '';

        req.on('data', (chunk) => {
            data += chunk.toString();
        })

        req.on('end', () => {
            let body = JSON.parse(data);
            let numbersArray = body.numbers.split(',').map(num => Number(num));
            console.log(numbersArray);
            let nod = NODMultiple(...numbersArray);

            resp.writeHead(200, {'Content-Type': 'text/html'});
            resp.end(nod.toString());
        })
    }
    else if(pathName == '/primes' && req.method == 'POST'){
        let data = '';

        req.on('data', (chunk) => {
            data += chunk.toString();
        })

        req.on('end', () => {
            let range = JSON.parse(data);
            console.log(range);
            let primes = findPrimesInRange(range.start, range.end);

            resp.writeHead(200, {'Content-Type': 'text/html'});
            resp.end(primes.toString());
        })
    }
    else{
        resp.writeHead(404, {'Content-Type': 'applicatoin/json'});
        resp.end(JSON.stringify({error: '404', message: 'URL not found'}));
    }
});

server.listen(5000);