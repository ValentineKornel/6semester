const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { createCanvas } = require('canvas');

let server;

const dutch_alphabet = "abcdefghijklmnopqrstuvwxyz";
const ukrainian_alphabet = "абвгґдеєжзиіїйклмнопрстуфхцчшщьюя";
const russian_alphabet = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя";
const belarusian_alphabet = "абвгдеёжзійклмнопрстуўфхцчш’ыьэюя";
const binary_aphabet = "01";

function convertStringToBinary(str){
    let binaryString = "";
    for(let i = 0; i < str.length; i++){
        binaryString += str.charCodeAt(i).toString(2);
    }
    return binaryString;
}

function calculateSymbolsFrequency(fileName, alphabet){
    let contents = fs.readFileSync(fileName, {encoding: "utf-8"});
    let resultFrequency = {};
    let symbolsCount = 0;
    console.log(alphabet == binary_aphabet);

    if(alphabet === binary_aphabet){
        contents = convertStringToBinary(contents);
    }else{
        contents = contents.toLowerCase();
    }

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

    for(let key in resultFrequency){
        resultFrequency[key] = resultFrequency[key] / symbolsCount;
    }
    return {symbolsCount: symbolsCount, frequency: resultFrequency}
}

function calculateEntropy(frequency){
    let entropyHs = 0;

    for(let symbol in frequency){
        entropyHs += frequency[symbol] * Math.log2(frequency[symbol]);
    }
    return -entropyHs;
}

function calculateInformationAmount(message, alphabetEntropy){
    let k = message.length;
    return alphabetEntropy * k;
}

function calculateEffectiveEntropy(p){
    let q = 1 - p;
    let conditionalEntropy = -p * Math.log2(p) - q * Math.log2(q);
    conditionalEntropy = Number.isNaN(conditionalEntropy) ? 0 : conditionalEntropy;
    return 1 - conditionalEntropy;
}

function generateHistogram(frequency) {
    const canvas = createCanvas(900, 315);
    const ctx = canvas.getContext('2d');
  
    ctx.fillStyle = 'rgb(46, 90, 249)';
    ctx.strokeStyle = 'rgb(7, 0, 53)';
    ctx.lineWidth = 1;
  
    const barWidth = 20; // Увеличиваем ширину столбцов для улучшения визуализации
    const gap = 5;

    let i = 0;
  
    // Максимальная высота гистограммы
    const maxHeight = 300;
  
    // Масштабирование высоты
    const scale = 1000;
  
    // Рисуем ось Y и добавляем подписи для промежуточных значений
    ctx.beginPath();
    ctx.moveTo(40, 0);
    ctx.lineTo(40, 300);
    ctx.stroke();
    
    // Добавляем подписи для значений по оси Y
    const yStep = 50; // Интервал между значениями оси Y
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
  
function sortFr(obj){
    const sortedObj = Object.keys(obj)
    .sort()  // Сортировка ключей по алфавиту
    .reduce((acc, key) => {
      acc[key] = obj[key];  // Собираем новый объект с отсортированными ключами
      return acc;
    }, {});
    return sortedObj;
}

server = http.createServer(function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/' && req.method == 'GET'){
        let dutchFileFrequency = calculateSymbolsFrequency('./Dutch.txt', dutch_alphabet);
        let ukranianFileFrequency = calculateSymbolsFrequency('./Ukranian.txt', ukrainian_alphabet);
        let binaryFileFrequency = calculateSymbolsFrequency('./Dutch.txt', binary_aphabet);
        console.log(dutchFileFrequency);

        let dutchEntropy = calculateEntropy(dutchFileFrequency.frequency).toFixed(2);
        let ukranianEntrypy = calculateEntropy(ukranianFileFrequency.frequency).toFixed(2);
        let binaryEntropy = calculateEntropy(binaryFileFrequency.frequency).toFixed(3);

        let dutchFIOInformation = calculateInformationAmount("Korneliuk Valentine Vladimirovich", dutchEntropy).toFixed(2);
        let ukranianFIOInformation = calculateInformationAmount("Корнелюк Валентін Владіміровіч", ukranianEntrypy).toFixed(2);
        let message = convertStringToBinary("Korneliuk Valentine Vladimirovich");
        let binaryFIOInformation = calculateInformationAmount(message, binaryEntropy).toFixed(2);

        let effectiveEntropy1 = calculateEffectiveEntropy(0.1).toFixed(2);
        let effectiveEntropy2 = calculateEffectiveEntropy(0.5).toFixed(2);
        let effectiveEntropy3 = calculateEffectiveEntropy(1).toFixed(2);

        let effectiveFIOInformation1 = calculateInformationAmount(message, effectiveEntropy1).toFixed(2);
        let effectiveFIOInformation2 = calculateInformationAmount(message, effectiveEntropy2).toFixed(2);
        let effectiveFIOInformation3 = calculateInformationAmount(message, effectiveEntropy3).toFixed(2);

        const dutchHistogramDataURL = generateHistogram(sortFr(dutchFileFrequency.frequency));
        const ukranianHistogramDataURL = generateHistogram(sortFr(ukranianFileFrequency.frequency));
        console.log(binaryFileFrequency);


        let russianFileFrequency = calculateSymbolsFrequency('./russian.txt', russian_alphabet);
        let belarusianFileFrequency = calculateSymbolsFrequency('./belarusian.txt', belarusian_alphabet);
        let russianEntropy = calculateEntropy(russianFileFrequency.frequency).toFixed(2);
        let belarusianEntoypy = calculateEntropy(belarusianFileFrequency.frequency).toFixed(2);


        let binaryAlpabetManualFrequencyCase1 = {"0": 0.25, "1": 0.75};
        let binaryAlpabetManualFrequencyCase2 = {"0": 1, "1": 0};
        let binaryAlpabetManualFrequencyCase3 = {"0": 0.5, "1": 0.5};

        let binaryAlpabetManualFrequencyEntropyCase1 = calculateEntropy(binaryAlpabetManualFrequencyCase1).toFixed(2);
        let binaryAlpabetManualFrequencyEntropyCase2 = calculateEntropy(binaryAlpabetManualFrequencyCase2).toFixed(2);
        let binaryAlpabetManualFrequencyEntropyCase3 = calculateEntropy(binaryAlpabetManualFrequencyCase3).toFixed(2);
        
        resp.writeHead(200, {'Content-Type': 'text/html'});
        resp.end(
            `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Анализ алфавитов</title>
            </head>
            <body>

                <div class="container">
                    <h3>Голландский алфавит</h3>
                    <p>Символов проанализировано: ${dutchFileFrequency.symbolsCount}<span class="highlight" id="dutchCount"></span></p>
                    <p>Энтропия голландского алфавита: ${dutchEntropy} бит<span class="highlight" id="dutchEntropy"></span></p>

                    <div style="border: 1px solid black; padding: 1px; width: 700px">
                    <h2><center>Частота появления символов в голландском алфавите</center></h2>
                    <img src="${dutchHistogramDataURL}" alt="Гистограмма"/>
                    </div>

                    <h3>Украинский алфавит</h3>
                    <p>Символов проанализировано: ${ukranianFileFrequency.symbolsCount}<span class="highlight" id="ukrCount"></span></p>
                    <p>Энтропия украинского алфавита: ${ukranianEntrypy} бит<span class="highlight" id="ukrEntropy"></span></p>

                    <div style="border: 1px solid black; padding: 1px; width: 850px">
                    <h2><center>Частота появления символов в украинском алфавите</center></h2>
                    <img src="${ukranianHistogramDataURL}" alt="Гистограмма"/>
                    </div>
                    

                    <h3>Бинарный алфавит</h3>
                    <p>Символов проанализировано: ${binaryFileFrequency.symbolsCount}<span class="highlight" id="dutchCount"></span></p>
                    <p>Энтропия бинарного алфавита: ${binaryEntropy} бит<span class="highlight" id="dutchEntropy"></span></p>

                    <h3>Количество информации</h3>
                    <p>В строке на голландском (Korneliuk Valentine Vladimirovich): ${dutchFIOInformation}</p>
                    <p>В строке на украинском (Корнелюк Валентін Владіміровіч): ${ukranianFIOInformation}</p>
                    <p>В бинарной строке: ${binaryFIOInformation}</p>

                    <h3>p = 0.1</h3>
                    <p>Эффективная энтропия: ${effectiveEntropy1}</p>
                    <p>Количество информации: ${effectiveFIOInformation1}</p>

                    <h3>p = 0.5</h3>
                    <p>Эффективная энтропия: ${effectiveEntropy2}</p>
                    <p>Количество информации: ${effectiveFIOInformation2}</p>

                    <h3>p = 1</h3>
                    <p>Эффективная энтропия: ${effectiveEntropy3}</p>
                    <p>Количество информации: ${effectiveFIOInformation3}</p>

                    <br><br>
                    <h3>Русский язык</h3>
                    <p>Энтропия: ${russianEntropy}</p>

                    <h3>Беларуский язык</h3>
                    <p>Энтропия: ${belarusianEntoypy}</p>
                    

                    <h3>p(0) = 0.25; p(1) = 0.75</h3>
                    <p>Энтропия Шенона: ${binaryAlpabetManualFrequencyEntropyCase1}</p>

                    <h3>p(0) = 0; p(1) = 1</h3>
                    <p>Энтропия Шенона: ${isNaN(binaryAlpabetManualFrequencyEntropyCase2) ? 0 : binaryAlpabetManualFrequencyEntropyCase2}</p>

                    <h3>p(0) = 0.5; p(1) = 0.5</h3>
                    <p>Энтропия Шенона: ${binaryAlpabetManualFrequencyEntropyCase3}</p>
                </div>

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