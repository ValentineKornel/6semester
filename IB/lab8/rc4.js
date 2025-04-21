const isPrime =  require('prime-number');
const GCD = require('compute-gcd');

const encryptRC4 = (input) => {
    let keysGenerator = new createKeysGenerator();
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
    const result = [];

    let paddedBuf = Buffer.from(buf);

    {
    let totalBits = paddedBuf.length * 8;
    let paddingBits = (6 - (totalBits % 6)) % 6; // от 0 до 5
    let paddingBytes = Math.ceil(paddingBits / 8);

    if (paddingBytes > 0) {
        let pad = Buffer.alloc(paddingBytes); // заполняется нулями
        paddedBuf = Buffer.concat([paddedBuf, pad]);
    }
    }

    let bitBuffer = 0;
    let bitLength = 0;

    for (let byte of paddedBuf) {
        bitBuffer = (bitBuffer << 8) | byte;
        bitLength += 8;

        while (bitLength >= 6) {
            bitLength -= 6;
            let block = (bitBuffer >> bitLength) & 0b111111;
            result.push(block ^ keysGenerator.getNextKey());
        }
    }

    // Обратно в байты
    bitBuffer = 0;
    bitLength = 0;
    let outputBytes = [];

    for (let block of result) {
        bitBuffer = (bitBuffer << 6) | block;
        bitLength += 6;

        while (bitLength >= 8) {
            bitLength -= 8;
            outputBytes.push((bitBuffer >> bitLength) & 0xFF);
        }
    }

    return Buffer.from(outputBytes);
}

function createKeysGenerator() {
    const N = 2 ** 6;
    let S = initializeS(N);
    let i = 0;
    let j = 0;

    function getNextKey() {
        i = (i + 1) % N;
        j = (j + S[i]) % N;
        [S[i], S[j]] = [S[j], S[i]];
        const a = (S[i] + S[j]) % N;
        const k = S[a];
        return k;
    }

    return { getNextKey };
}


const initializeS = (N) => {
    let S = [0, 1,  2,  3,  4,  5,  6,  7,  8,  9,  10, 11, 12, 13, 14, 15,
            16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
            32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
            48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63
    ];

    let K = [61, 60, 23, 22, 21, 20, 61, 60, 23, 22, 21, 20, 61, 60, 23, 22,
            21, 20, 61, 60, 23, 22, 21, 20, 61, 60, 23, 22, 21, 20, 61, 60,
            23, 22, 21, 20, 61, 60, 23, 22, 21, 20, 61, 60, 23, 22, 21, 20,
            61, 60, 23, 22, 21, 20, 61, 60, 23, 22, 21, 20, 61, 60, 23, 22
    ];
    
    let i = j = 0;

    while(i < N){
        j = (j + S[i] + K[i]) % N;
        [S[i], S[j]] = [S[j], S[i]];
        i += 1;
    }

    return S;
}


module.exports = {encryptRC4};