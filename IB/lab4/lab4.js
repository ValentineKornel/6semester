const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createCanvas } = require('canvas');
const { performance } = require("perf_hooks");

let server;

const GERMAN_APHABET = "abcdefghijklmnopqrstuvwxyzäöüß";

let mess = "Hallo Ich haiße Valentine Ich bin zwanzig jahre alt";
let enc = encodeCaesar(mess, GERMAN_APHABET, 7);
console.log(enc);
let dec = decodeCaesar(enc, GERMAN_APHABET, 7);
console.log(dec);

function encodeCaesar(text, alphabet, k){
    text = text.toLowerCase();
    let cipherText = "";
    let N = alphabet.length;

    for(let i = 0; i < text.length; i++){
        if(alphabet.includes(text[i])){
            let x = alphabet.indexOf(text[i]);
            let y = (x + k) % N;

            cipherText += alphabet[y];
        }
    }
    return cipherText;
}

function decodeCaesar(text, alphabet, k){
    text = text.toLowerCase();
    let originalText = "";
    let N = alphabet.length;

    for(let i = 0; i < text.length; i++){
        let y = alphabet.indexOf(text[i]);
        let x = (y - k) % N;
        if(x < 0 ) x += N;

        originalText += alphabet[x];
    }
    return originalText;
}


function calculateSymbolsFrequency(text, alphabet){
    let contents = text.toLowerCase();
    let resultFrequency = {};
    let symbolsCount = 0;


    for(let i = 0; i < contents.length; i++){
        let symbol = contents[i];
        if(alphabet.includes(symbol)){
            if(symbol in resultFrequency){
                resultFrequency[symbol]++;
            }else{
                resultFrequency[symbol] = 1;
            }
            symbolsCount++;
        }
    }

    // for(let key in resultFrequency){
    //     resultFrequency[key] = resultFrequency[key] / symbolsCount;
    // }
    return {symbolsCount: symbolsCount, frequency: resultFrequency}
}

function generateHistogram(frequency) {
    const canvas = createCanvas(900, 315);
    const ctx = canvas.getContext('2d');
  
    ctx.fillStyle = 'rgb(46, 90, 249)';
    ctx.strokeStyle = 'rgb(7, 0, 53)';
    ctx.lineWidth = 1;
  
    const barWidth = 17; // Увеличиваем ширину столбцов для улучшения визуализации
    const gap = 5;

    let i = 0;
  
    // Максимальная высота гистограммы
    const maxHeight = 2000;
  
    // Масштабирование высоты
    const scale = 0.04;
  
    // Рисуем ось Y и добавляем подписи для промежуточных значений
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, 300);
    ctx.stroke();
    
    // Добавляем подписи для значений по оси Y
    const yStep = 100; // Интервал между значениями оси Y
    for (let y = 0; y <= maxHeight; y += yStep) {
      const yPos = 300 - y; // Расположение по оси Y (снизу вверх)
      ctx.moveTo(30, yPos); // Рисуем вертикальные линии
      ctx.lineTo(40, yPos);
      ctx.stroke();
  
      // Подпись значения
      ctx.fillText(y / scale, 10, yPos); // Печатаем значение на оси Y
    }
  
    for (let key in frequency) {
      // Масштабируем высоту столбцов, чтобы они были видимыми
      let height = frequency[key] * scale;
      const x = i++ * (barWidth + gap) + 40; // Вычисляем позицию по оси X
      const y = 300 - height; // Считаем позицию по оси Y
  
      // Ограничиваем максимальную высоту столбца
      if (height > maxHeight) height = maxHeight;
  
      // Рисуем столбцы гистограммы
      ctx.fillRect(x, y, barWidth, height);
      ctx.strokeRect(x, y, barWidth, height);
  
      // Подписи к столбцам
      ctx.fillText(key, x + barWidth / 4, 310);
    }
  
    return canvas.toDataURL(); // Возвращаем изображение в формате Base64
}

function generateHistogram2(frequency) {
    const canvas = createCanvas(900, 315);
    const ctx = canvas.getContext('2d');
  
    ctx.fillStyle = 'rgb(46, 90, 249)';
    ctx.strokeStyle = 'rgb(7, 0, 53)';
    ctx.lineWidth = 1;
  
    const barWidth = 17; // Увеличиваем ширину столбцов для улучшения визуализации
    const gap = 5;

    let i = 0;
  
    // Максимальная высота гистограммы
    const maxHeight = 300;
  
    // Масштабирование высоты
    const scale = 14;
  
    // Рисуем ось Y и добавляем подписи для промежуточных значений
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, 300);
    ctx.stroke();
    
    // Добавляем подписи для значений по оси Y
    const yStep = 20; // Интервал между значениями оси Y
    for (let y = 0; y <= maxHeight; y += yStep) {
      const yPos = 300 - y; // Расположение по оси Y (снизу вверх)
      ctx.moveTo(30, yPos); // Рисуем вертикальные линии
      ctx.lineTo(40, yPos);
      ctx.stroke();
  
      // Подпись значения
      ctx.fillText((y / scale).toFixed(1), 10, yPos); // Печатаем значение на оси Y
    }
  
    for (let key in frequency) {
      // Масштабируем высоту столбцов, чтобы они были видимыми
      let height = frequency[key] * scale;
      const x = i++ * (barWidth + gap) + 40; // Вычисляем позицию по оси X
      const y = 300 - height; // Считаем позицию по оси Y
  
      // Ограничиваем максимальную высоту столбца
      if (height > maxHeight) height = maxHeight;
  
      // Рисуем столбцы гистограммы
      ctx.fillRect(x, y, barWidth, height);
      ctx.strokeRect(x, y, barWidth, height);
  
      // Подписи к столбцам
      ctx.fillText(key, x + barWidth / 4, 310);
    }
  
    return canvas.toDataURL(); // Возвращаем изображение в формате Base64
}
  
function sortFr(obj){
    const sortedObj = Object.keys(obj)
    .sort()  // Сортировка ключей по алфавиту
    .reduce((acc, key) => {
      acc[key] = obj[key];  // Собираем новый объект с отсортированными ключами
      return acc;
    }, {});
    return sortedObj;
}

function addLineBreaks(text, lineLength) {
    let result = '';
    for (let i = 0; i < text.length; i += lineLength) {
        result += text.slice(i, i + lineLength) + '\n';
    }
    return result;
}

function formTrimusTable(k, m, keyword, alphabet){
    let resultTable = [];
    let keywordArray = keyword.split('');
    let alphabetArray = alphabet.split('');

    for(let i = 0; i < k; i++){
        let row = [];
        for(let j = 0; j < m; j++){
            if(keywordArray.length !== 0){
                row.push(keywordArray.shift());
            }else{
                let symbol = alphabetArray.shift();
                while(keyword.includes(symbol)){
                    symbol = alphabetArray.shift();
                }
                row.push(symbol);
            }
        }
        resultTable.push(row);
    }
    return resultTable;
}

function encodeTruthemius(text, trithemiusTable, alphabet){
    let k = trithemiusTable.length;
    let result = '';
    text = text.toLowerCase();

    for(let i = 0; i < text.length; i++){
        if(alphabet.includes(text[i])){
            let currentIndex = getIndexInMatrix(trithemiusTable, text[i])
            let newIndex = [];

            if(currentIndex[0] === k - 1){
                newIndex = [0, currentIndex[1]];
            }else{
                newIndex = [currentIndex[0] + 1, currentIndex[1]];
            }

            result += trithemiusTable[newIndex[0]][newIndex[1]];
        }
    }
    return result;
}

function decodeTruthemius(text, trithemiusTable){
    let k = trithemiusTable.length;
    let originalText = '';

    for(let i = 0; i < text.length; i++){
        let currentIndex = getIndexInMatrix(trithemiusTable, text[i]);
        let newIndex = [];

        if(currentIndex[0] === 0){
            newIndex = [k - 1, currentIndex[1]];
        }else{
            newIndex = [currentIndex[0] - 1, currentIndex[1]];
        }
        originalText += trithemiusTable[newIndex[0]][newIndex[1]];
    }
    return originalText;
}

const getIndexInMatrix = (arr, k) => {
    for (let i = 0; i < arr.length; i++) {
        let index = arr[i].indexOf(k);
        if (index > -1) {
            return [i, index];
        }
    }
    return [-1, -1];
}

server = http.createServer(function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/' && req.method == 'GET'){
        let start;
        let end;
        let k = 7;
        let text = fs.readFileSync('./original.txt').toString();

        let germanFileFrequency = calculateSymbolsFrequency(text, GERMAN_APHABET);
        console.log(germanFileFrequency.frequency);
        const germanhHistogramDataURL = generateHistogram(sortFr(germanFileFrequency.frequency));

        start = performance.now();
        let cipherText = encodeCaesar(text, GERMAN_APHABET, k);
        end = performance.now();
        let timeEncode = end - start;

        let cipherTextFrequency = calculateSymbolsFrequency(cipherText, GERMAN_APHABET);
        const cipherhHistogramDataURL = generateHistogram(sortFr(cipherTextFrequency.frequency));

        start = performance.now();
        let decodedText = decodeCaesar(cipherText, GERMAN_APHABET, k);
        end = performance.now();
        let timeDecode = end - start;

        let table = formTrimusTable(6, 5, 'enigma', GERMAN_APHABET);

        start = performance.now();
        let cipherTextTrithemius = encodeTruthemius(text, table, GERMAN_APHABET);
        end = performance.now();
        let timeEncodeTrithemius = end - start;

        start = performance.now();
        let decodedTextTrithemius = decodeTruthemius(cipherTextTrithemius, table);
        end = performance.now();
        let timeDecodeTrithemius = end - start;


        let decodedText1Frequency = calculateSymbolsFrequency(decodedTextTrithemius, GERMAN_APHABET);
        const decodedText1HistogramDataURL = generateHistogram(sortFr(decodedText1Frequency.frequency));


        let cipherTextTrithemiusFrequency = calculateSymbolsFrequency(cipherTextTrithemius, GERMAN_APHABET);
        const cipherhTrithemiusHistogramDataURL = generateHistogram(sortFr(cipherTextTrithemiusFrequency.frequency));


        resp.writeHead(200, {'Content-Type': 'text/html'});
        resp.end(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Анализ алфавитов</title>
                <style>
                    .container {
                        display: flex; 
                        gap: 20px;       
                        justify-content: center; 
                        padding: 20px;
                    }

                    .text-wrapper {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                    }

                    .text-box {
                        width: 700px;
                        height: 300px;
                        border: 2px solid black;
                        padding: 10px;
                        overflow: auto;
                        background-color: #f9f9f9;
                        font-family: Arial, sans-serif;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    th, td {
                        border: 1px solid black;
                        padding: 8px;
                        text-align: center;
                    }
                </style>
            </head>
            <body>
                <div class="text-wrapper">
                        <h3>Исходный текст (количество символов ${germanFileFrequency.symbolsCount})</h3>
                        <div id="original-text" class="text-box">
                            ${text}
                        </div><br/>
                        <div class="container">
                        <div style="border: 1px solid black; padding: 1px; width: 720px">
                            <h2><center>Частота появления символов в исходном тексте</center></h2>
                            <img src="${germanhHistogramDataURL}" alt="Гистограмма"/>
                        </div>
                    </div>
                        <span style="font-size: 20px">Исходный алфавит: ${GERMAN_APHABET}</span>
                </div>

                <div class="container">
                    <div class="text-wrapper">
                        <h3>Зашифрованный текст (${timeEncode.toFixed(4)}ms)</h3>
                        <div id="ciped-text" class="text-box">
                            ${addLineBreaks(cipherText, 85)}
                        </div>
                    </div>
                    <div class="text-wrapper">
                        <h3>Расшифрованный текст (${timeDecode.toFixed(4)}ms)</h3>
                        <div id="original-text" class="text-box">
                            ${addLineBreaks(decodedText, 85)}
                        </div>
                    </div>
                </div>
                <div class="container">
                    <div style="border: 1px solid black; padding: 1px; width: 720px">
                        <h2><center>Частота появления символов в зашифрованном тексте</center></h2>
                        <img src="${cipherhHistogramDataURL}" alt="Гистограмма"/>
                    </div>

                    <div style="border: 1px solid black; padding: 1px; width: 720px;">
                        <h2><center>Частота появления символов в исходном тексте</center></h2>
                        <img src="${decodedText1HistogramDataURL}" alt="Гистограмма"/>
                    </div>
                </div>

                <center><h2>Таблица Трисемуса</h2></center>
                <div id="table-container"></div>

                <div class="container">
                    <div class="text-wrapper">
                        <h3>Зашифрованный текст (${timeEncodeTrithemius.toFixed(4)}ms)</h3>
                        <div id="ciped-text" class="text-box">
                            ${addLineBreaks(cipherTextTrithemius, 85)}
                        </div>
                    </div>
                    <div class="text-wrapper">
                        <h3>Расшифрованный текст (${timeDecodeTrithemius.toFixed(4)}ms)</h3>
                        <div id="original-text" class="text-box">
                            ${addLineBreaks(decodedTextTrithemius, 85)}
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div style="border: 1px solid black; padding: 1px; width: 720px">
                        <h2><center>Частота появления символов в зашифрованном тексте</center></h2>
                        <img src="${cipherhTrithemiusHistogramDataURL}" alt="Гистограмма"/>
                    </div>

                    <div style="border: 1px solid black; padding: 1px; width: 720px;">
                        <h2><center>Частота появления символов в исходном тексте</center></h2>
                        <img src="${germanhHistogramDataURL}" alt="Гистограмма"/>
                    </div>
                </div>

                <script>
                    // Двумерный массив
                    const data = ${JSON.stringify(table)}


                    // Функция для отрисовки таблицы
                    function generateTable(data) {
                        let table = "<table>";
                        
                        // Создание заголовка
                        table += "<thead><tr>";
                        table += "</tr></thead>";

                        // Создание строк данных
                        table += "<tbody>";
                        for (let i = 0; i < data.length; i++) {
                            table += "<tr>";
                            for (let j = 0; j < data[i].length; j++) {
                                table += "<td>" + data[i][j] + "</td>";
                            }
                            table += "</tr>";
                        }
                        table += "</tbody>";
                        table += "</table>";
                        
                        return table;
                    }

                    // Отрисовка таблицы в контейнер
                    document.getElementById("table-container").innerHTML = generateTable(data);
                </script>

            </body>
            </html>
            `
        );
    }
    else{
        resp.writeHead(404, {'Content-Type': 'applicatoin/json'});
        resp.end(JSON.stringify({error: '404', message: 'URL not found'}));
    }
});

server.listen(5000);