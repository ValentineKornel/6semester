const { encryptRC4 } = require("./rc4");


// const xorUtf8Buffer = (input, xorValue = 54) => {
//     const buf = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
//     const result = [];

//     let paddedBuf = Buffer.from(buf);

//     // Посчитаем, сколько бит в буфере, и добавим нули если не кратно 6
//     let totalBits = paddedBuf.length * 8;
//     let paddingBits = (6 - (totalBits % 6)) % 6; // от 0 до 5
//     let paddingBytes = Math.ceil(paddingBits / 8);

//     if (paddingBytes > 0) {
//         let pad = Buffer.alloc(paddingBytes); // заполняется нулями
//         paddedBuf = Buffer.concat([paddedBuf, pad]);
//     }

//     let bitBuffer = 0;
//     let bitLength = 0;

//     for (let byte of paddedBuf) {
//         bitBuffer = (bitBuffer << 8) | byte;
//         bitLength += 8;

//         while (bitLength >= 6) {
//             bitLength -= 6;
//             let block = (bitBuffer >> bitLength) & 0b111111;
//             result.push(block ^ xorValue);
//         }
//     }

//     // Обратно в байты
//     bitBuffer = 0;
//     bitLength = 0;
//     let outputBytes = [];

//     for (let block of result) {
//         bitBuffer = (bitBuffer << 6) | block;
//         bitLength += 6;

//         while (bitLength >= 8) {
//             bitLength -= 8;
//             outputBytes.push((bitBuffer >> bitLength) & 0xFF);
//         }
//     }

//     return Buffer.from(outputBytes);
// };

// Пример:
// const input = "Привет я валик";
// const encryptedBuf = xorUtf8Buffer(input);
// const hexString = encryptedBuf.toString('hex')
// console.log(hexString);
// const buffer = Buffer.from(hexString, 'hex');

// const decrypted = xorUtf8Buffer(buffer).toString('utf8');
// console.log("Decrypted:", decrypted);






const input = "Hello my name is valentine";
const encryptedBuf = encryptRC4(input);
const hexString = encryptedBuf.toString('hex')
console.log(hexString);
const buffer = Buffer.from(hexString, 'hex');

const decrypted = encryptRC4(buffer).toString('utf8');
console.log("Decrypted:", decrypted);


