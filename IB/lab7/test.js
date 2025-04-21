const forge = require('node-forge');

// Настоящий слабый ключ
const weakKeyHex = '0101010101010101';
const weakKey = forge.util.hexToBytes(weakKeyHex);

// Исходный текст
const plaintext = 'hello123'; // длина 8 байт, чтобы избежать padding

// Шифрование
const encrypt = (msg, key) => {
    const cipher = forge.cipher.createCipher('DES-ECB', key);
    const buffer = forge.util.createBuffer(msg, 'utf8');
    cipher.start({ padding: false }); // отключаем padding
    cipher.update(buffer);
    cipher.finish();
    return cipher.output;
};

// Расшифровка
const decrypt = (enc, key) => {
    const decipher = forge.cipher.createDecipher('DES-ECB', key);
    decipher.start({ padding: false });
    decipher.update(forge.util.createBuffer(enc));
    decipher.finish();
    return decipher.output.toString();
};

// Первый раз шифруем
const firstEncryption = encrypt(plaintext, weakKey);
const encryptedBase64 = forge.util.encode64(firstEncryption.getBytes());
console.log(encryptedBase64);
// Второй раз шифруем результат
const secondEncryption = encrypt(firstEncryption.getBytes(), weakKey);

// Дешифруем второй результат
const final = decrypt(secondEncryption.getBytes(), weakKey);

console.log('Исходный текст     :', plaintext);
console.log('После двух DES-кодов:', final); // ← Должно быть тем же, что и plaintext
