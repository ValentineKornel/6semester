const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createCanvas } = require('canvas');
const { performance } = require("perf_hooks");

let server;

const GERMAN_APHABET = "abcdefghijklmnopqrstuvwxyzäöüß ,;-.";

//let mess = "тестовое сообщение";
let mess = fs.readFileSync('./original.txt').toString();

function shuffleEncode(text, k, s){
    let encodeTable = formEncodeMessageTable(text, k, s);
    let cipherText = readSnakeColOrder(encodeTable);
    return cipherText;
}

function shuffleDecode(cipherText, k, s){
    let decodeTable = formDecodeMessageTable(cipherText, k, s);
    let originalText = readTableByRows(decodeTable);
    return originalText;
}

function formEncodeMessageTable(message, cols, rows) {
    message = message.replace(/[\n\r]/g, '');
    let table = [];
    let index = 0;

    for (let i = 0; i < rows; i++) {
        let row = [];
        for (let j = 0; j < cols; j++) {
            if (index < message.length) {
                row.push(message[index]);
                index++;
            } else {
                row.push(' ');
            }
        }
        table.push(row);
    }
    return table;
}

function readSnakeColOrder(table) {
    let rows = table.length;
    let cols = table[0].length;
    let result = '';

    for (let j = 0; j < cols; j++) {
        if (j % 2 === 0) {
            // up to down
            for (let i = 0; i < rows; i++) {
                result += table[i][j];
            }
        } else {
            // down to up
            for (let i = rows - 1; i >= 0; i--) {
                result += table[i][j];
            }
        }
    }
    return result;
}

function formDecodeMessageTable(cipherText, cols, rows) {
    let table = Array.from({ length: rows }, () => Array(cols).fill(' '));
    let index = 0;

    for (let j = 0; j < cols; j++) { 
        if (j % 2 === 0) { 
            // Четные столбцы (0, 2, 4...) — сверху вниз
            for (let i = 0; i < rows; i++) {
                if (index < cipherText.length) {
                    table[i][j] = cipherText[index++];
                }
            }
        } else { 
            // Нечетные столбцы (1, 3, 5...) — снизу вверх
            for (let i = rows - 1; i >= 0; i--) {
                if (index < cipherText.length) {
                    table[i][j] = cipherText[index++];
                }
            }
        }
    }
    return table;
}

function readTableByRows(table) {
    let result = '';
    for (let row of table) {
        result += row.join('');
    }
    return result;
}


function multipleShuffleEncode(text, colKey, rowKey) {
    let cols = colKey.length;
    let rows = Math.ceil(text.length / cols);

    let table = Array.from({ length: rows }, () => Array(cols).fill(' '));
    let index = 0;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            if (index < text.length) {
                table[i][j] = text[index++];
            }
        }
    }

    let columnSortedTable = Array.from({ length: rows }, () => Array(cols));
    for (let i = 0; i < cols; i++) {
        let newCol = colKey[i] - 1; 
        for (let j = 0; j < rows; j++) {
            columnSortedTable[j][newCol] = table[j][i];
        }
    }

    let rowSortedTable = Array.from({ length: rows }, () => Array(cols));
    for (let i = 0; i < rows; i++) {
        let newRow = rowKey[i] - 1;
        rowSortedTable[newRow] = columnSortedTable[i];
    }
    let cipherText = rowSortedTable.flat().join('');
    return {cipherText, table, columnSortedTable, rowSortedTable};
}

function multipleShuffleDecode(text, colKey, rowKey) {
    let cols = colKey.length;
    let rows = Math.ceil(text.length / cols);
    
    let sortedRowKey = [...rowKey].map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    let rowReorderedTable = Array.from({ length: rows }, () => Array(cols));
    let index = 0;

    for (let i = 0; i < rows; i++) {
        rowReorderedTable[sortedRowKey[i][1]] = text.slice(index, index + cols).split('');
        index += cols;
    }

    let sortedColKey = [...colKey].map((v, i) => [v, i]).sort((a, b) => a[0] - b[0]);
    let finalTable = Array.from({ length: rows }, () => Array(cols));

    for (let i = 0; i < cols; i++) {
        let originalCol = sortedColKey[i][1];
        for (let j = 0; j < rows; j++) {
            finalTable[j][originalCol] = rowReorderedTable[j][i];
        }
    }
    return finalTable.flat().join('').trim();
}

function generateKeyFromWord(word) {
    let sortedChars = word.split('').sort();
    let positions = {};
    for (let i = 0; i < sortedChars.length; i++) {
        if (!positions[sortedChars[i]]) {
            positions[sortedChars[i]] = [];
        }
        positions[sortedChars[i]].push(i + 1);
    }

    let key = [];
    for (let i = 0; i < word.length; i++) {
        key.push(positions[word[i]].shift());
    }
    return key;
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
    const maxHeight = 300;
  
    // Масштабирование высоты
    const scale = 2;
  
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
    .sort()
    .reduce((acc, key) => {
      acc[key] = obj[key];  // Собираем новый объект с отсортированными ключами
      return acc;
    }, {});
    return sortedObj;
}

function addKeyesToTable(table, colWord, colKey, rowWord, rowKey){

        // Убираем пробелы и лишние символы
    //text = text.replace(/[\n\r\s]/g, '');
    

    let tableWithKeys = Array.from({ length: 11 }, () => Array(11).fill(' '));

    for (let i = 0; i < table.length; i++) {
        for (let j = 0; j < table[i].length; j++) {
            let newI = i + 2;
            let newJ = j + 2;
            
            if (newI < tableWithKeys.length && newJ < tableWithKeys[i].length) {
                tableWithKeys[newI][newJ] = table[i][j];
            }
        }
    }
    tableWithKeys[0][2] = colWord[0];
    tableWithKeys[0][3] = colWord[1];
    tableWithKeys[0][4] = colWord[2];
    tableWithKeys[0][5] = colWord[3];
    tableWithKeys[0][6] = colWord[4];
    tableWithKeys[0][7] = colWord[5];
    tableWithKeys[0][8] = colWord[6];
    tableWithKeys[0][9] = colWord[7];
    tableWithKeys[0][10] = colWord[8];

    tableWithKeys[1][2] = colKey[0];
    tableWithKeys[1][3] = colKey[1];
    tableWithKeys[1][4] = colKey[2];
    tableWithKeys[1][5] = colKey[3];
    tableWithKeys[1][6] = colKey[4];
    tableWithKeys[1][7] = colKey[5];
    tableWithKeys[1][8] = colKey[6];
    tableWithKeys[1][9] = colKey[7];
    tableWithKeys[1][10] = colKey[8];


    tableWithKeys[2][0] = rowWord[0];
    tableWithKeys[3][0] = rowWord[1];
    tableWithKeys[4][0] = rowWord[2];
    tableWithKeys[5][0] = rowWord[3];
    tableWithKeys[6][0] = rowWord[4];
    tableWithKeys[7][0] = rowWord[5];
    tableWithKeys[8][0] = rowWord[6];
    tableWithKeys[9][0] = rowWord[7];
    tableWithKeys[10][0] = rowWord[8];

    tableWithKeys[2][1] = rowKey[0];
    tableWithKeys[3][1] = rowKey[1];
    tableWithKeys[4][1] = rowKey[2];
    tableWithKeys[5][1] = rowKey[3];
    tableWithKeys[6][1] = rowKey[4];
    tableWithKeys[7][1] = rowKey[5];
    tableWithKeys[8][1] = rowKey[6];
    tableWithKeys[9][1] = rowKey[7];
    tableWithKeys[10][1] = rowKey[8];

    return tableWithKeys;
}

server = http.createServer(function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/' && req.method == 'GET'){
        let start;
        let end;
        let k = 24;
        let s = 24;
        let text = fs.readFileSync('./original.txt').toString();

        let germanFileFrequency = calculateSymbolsFrequency(text, GERMAN_APHABET);
        const germanhHistogramDataURL = generateHistogram(sortFr(germanFileFrequency.frequency));

        start = performance.now();
        let encodeTable = formEncodeMessageTable(text, k, s);
        let cipherText1 = readSnakeColOrder(encodeTable);
        end = performance.now();
        let timeDecodeShuffle = end - start;
        let cipherTextFrequency = calculateSymbolsFrequency(cipherText1, GERMAN_APHABET);
        const cipherHistogramDataURL = generateHistogram(sortFr(cipherTextFrequency.frequency));
        
        start = performance.now();
        let decodeTable = formDecodeMessageTable(cipherText1, k, s);
        let decodedText1 = readTableByRows(decodeTable);
        end = performance.now();
        let timeEnodeShuffle = end - start;

        let decodedText1Frequency = calculateSymbolsFrequency(decodedText1, GERMAN_APHABET);
        const decoded1tHistogramDataURL = generateHistogram(sortFr(decodedText1Frequency.frequency));


        let text2 = fs.readFileSync('./original2.txt').toString();

        let originalTextFrequency = calculateSymbolsFrequency(text2, GERMAN_APHABET);
        const originalTextHistogramDataURL = generateHistogram2(sortFr(originalTextFrequency.frequency));


        let colKey = generateKeyFromWord('korneliuk');
        let rowKey = generateKeyFromWord('valentine');

        start = performance.now();
        let {cipherText, table, columnSortedTable, rowSortedTable} = multipleShuffleEncode(text2, colKey, rowKey);
        end = performance.now();
        let timeEnodeMultipleShuffle = end - start;

        let cipherText2Frequency = calculateSymbolsFrequency(cipherText, GERMAN_APHABET);
        const cipherText2HistogramDataURL = generateHistogram2(sortFr(cipherText2Frequency.frequency));

        let tableWithKeys  = addKeyesToTable(table, 'korneliuk'.split(''), [3, 7, 8, 6, 1, 5, 2, 9, 4], 'valentine'.split(''), [9, 1, 5, 2, 6, 8, 4, 7, 3]);
        let columnSortedTableWithKeys = addKeyesToTable(columnSortedTable, 'eikklnoru'.split(''), [1, 2, 3, 4, 5, 6, 7, 8, 9], 'valentine'.split(''), [9, 1, 5, 2, 6, 8, 4, 7, 3]);
        let rowSortedTableWithKeys = addKeyesToTable(rowSortedTable, 'eikklnoru'.split(''), [1, 2, 3, 4, 5, 6, 7, 8, 9], 'aeeilnntv'.split(''), [1, 2, 3, 4, 5, 6, 7, 8, 9]);

        start = performance.now();
        let decodedText = multipleShuffleDecode(cipherText, colKey, rowKey);
        end = performance.now();
        let timeDecodeMultipleShuffle = end - start;

        let decodedText2Frequency = calculateSymbolsFrequency(decodedText, GERMAN_APHABET);
        const decoded2tHistogramDataURL = generateHistogram2(sortFr(decodedText2Frequency.frequency));

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
                        height: 150px;
                        border: 2px solid black;
                        padding: 10px;
                        overflow: auto;
                        background-color: #f9f9f9;
                        font-family: Arial, sans-serif;
                    }
                    table {
                        width: 60%;
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
                    <div style="border: 1px solid black; padding: 1px; width: 720px;">
                        <h2><center>Частота появления символов в исходном тексте</center></h2>
                        <img src="${germanhHistogramDataURL}" alt="Гистограмма"/>
                    </div>
                </div>
                </div>

                <center><h2>Таблица Перестановки</h2></center>
                <center><div id="shuffle-table-container"></div></center>

                <div class="container">
                    <div class="text-wrapper">
                        <h3>Зашифрованный текст (${timeEnodeShuffle.toFixed(4)}ms)</h3>
                        <div id="ciped-text" class="text-box">
                            ${cipherText1}
                        </div>
                    </div>
                    <div class="text-wrapper">
                        <h3>Расшифрованный текст (${timeDecodeShuffle.toFixed(4)}ms)</h3>
                        <div id="original-text" class="text-box">
                            ${decodedText1}
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div style="border: 1px solid black; padding: 1px; width: 720px">
                        <h2><center>Частота появления символов в зашифрованном тексте</center></h2>
                        <img src="${cipherHistogramDataURL}" alt="Гистограмма"/>
                    </div>

                    <div style="border: 1px solid black; padding: 1px; width: 720px;">
                        <h2><center>Частота появления символов в исходном тексте</center></h2>
                        <img src="${decoded1tHistogramDataURL}" alt="Гистограмма"/>
                    </div>
                </div>


                <div class="text-wrapper">
                    <h3>Исходный текст</h3>
                    <div id="original-text" class="text-box">
                        ${text2}
                    </div><br/>
                    <div class="container">
                    <div style="border: 1px solid black; padding: 1px; width: 720px;">
                        <h2><center>Частота появления символов в исходном тексте</center></h2>
                        <img src="${originalTextHistogramDataURL}" alt="Гистограмма"/>
                    </div>
                </div>
                </div>
                
                <center><span style="font-size: 20px">Исходная таблица</span></center>
                <center><div id="start-table"></div></center><br/>

                <center><span style="font-size: 20px">Таблица после перестановки столбцов</span></center>
                <center><div id="step1-table"></div></center><br/>

                <center><span style="font-size: 20px">Таблица после перестановки строк</span></center>
                <center><div id="step2-table"></div></center>

                <div class="container">
                    <div class="text-wrapper">
                        <h3>Зашифрованный текст (${timeEnodeMultipleShuffle.toFixed(4)}ms)</h3>
                        <div id="ciped-text" class="text-box">
                            ${cipherText}
                        </div>
                    </div>
                    <div class="text-wrapper">
                        <h3>Расшифрованный текст (${timeDecodeMultipleShuffle.toFixed(4)}ms)</h3>
                        <div id="original-text" class="text-box">
                            ${decodedText}
                        </div>
                    </div>
                </div>

                <div class="container">
                    <div style="border: 1px solid black; padding: 1px; width: 720px">
                        <h2><center>Частота появления символов в зашифрованном тексте</center></h2>
                        <img src="${cipherText2HistogramDataURL}" alt="Гистограмма"/>
                    </div>

                    <div style="border: 1px solid black; padding: 1px; width: 720px;">
                        <h2><center>Частота появления символов в исходном тексте</center></h2>
                        <img src="${decoded2tHistogramDataURL}" alt="Гистограмма"/>
                    </div>
                </div>


                <script>
                    // Двумерный массив
                    const data = ${JSON.stringify(encodeTable)}
                    const data2 = ${JSON.stringify(tableWithKeys)}
                    const data3 = ${JSON.stringify(columnSortedTableWithKeys)}
                    const data4 = ${JSON.stringify(rowSortedTableWithKeys)}

                    // Функция для отрисовки таблицы
                    function generateTable(data, k) {
                        let table = "<table>";
                        
                        // Создание заголовка
                        table += "<thead><tr>";
                        table += "</tr></thead>";

                        // Создание строк данных
                        table += "<tbody>";
                        for (let i = 0; i < k; i++) {
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
                    document.getElementById("shuffle-table-container").innerHTML = generateTable(data, ${k});
                    document.getElementById("start-table").innerHTML = generateTable(data2, ${11});
                    document.getElementById("step1-table").innerHTML = generateTable(data3, ${11});
                    document.getElementById("step2-table").innerHTML = generateTable(data4, ${11});

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