const {Bytes, Hex, util} =  require("node-forge");
const forge = require('node-forge');
const hexToBinary = require('hex-to-binary');


const iv = forge.random.getBytesSync(8);


const encrypt = (msg, key) => {
    if (typeof key === 'string' && key.startsWith("0x")) {
        key = hexStringToBytes(key.slice(2));
    } else if (typeof key === 'string') {
        key = textToBytes(key);
    }
    console.log(convertStringToBinary(key));

    const cipher = forge.cipher.createCipher('DES-ECB', key);

    let textBuffer;

    if (typeof msg === 'string') {
        if (msg.startsWith("0x")) {
            const hex = msg.slice(2);
            const bytes = forge.util.hexToBytes(hex);
            textBuffer = forge.util.createBuffer(bytes, 'raw');
        } else {
            textBuffer = forge.util.createBuffer(msg, 'utf8');
        }
    } else if (msg instanceof forge.util.ByteBuffer) {
        textBuffer = msg;
    } else if (Buffer.isBuffer(msg)) {
        textBuffer = forge.util.createBuffer(msg.toString('binary'), 'raw');
    } else if (typeof msg === 'object' && msg.bytes) {
        textBuffer = forge.util.createBuffer(msg.bytes, 'raw');
    } else {
        throw new Error("Unsupported message type for encryption");
    }

    cipher.start({iv: iv});
    cipher.update(textBuffer);
    cipher.finish();

    return cipher.output;
};

const EEE2Encrypt = (msg, key1, key2) => {
    let enc1 = encrypt(msg, key1);
    let enc2 = encrypt(enc1, key2);
    let enc3 = encrypt(enc2, key1);
    return enc3;
}

const EEE2Decrypt = (encrypted, key1, key2) => {
    let dec1 = decrypt(encrypted, key1);
    let dec2 = decrypt(dec1.toHex(), key2);
    let dec3 = decrypt(dec2.toHex(), key1);
    return dec3;
}



const decrypt = (encrypted, key) => {
    if (typeof key === 'string' && key.startsWith("0x")) {
        key = hexStringToBytes(key.slice(2));
        console.log(convertStringToBinary(key));
    } else if (typeof key === 'string') {
        key = textToBytes(key);
        console.log(convertStringToBinary(key));
    }
    
    const decipher = forge.cipher.createDecipher('DES-ECB', key);
    const encryptedBytes = forge.util.hexToBytes(encrypted);
    decipher.start({iv: iv});
    decipher.update(forge.util.createBuffer(encryptedBytes));
    decipher.finish();
    return decipher.output;
};

const textToBytes = (text) => {
    let bytes = forge.util.createBuffer(text, 'utf8').getBytes();
    return bytes;
}

const hexStringToBytes = (hex) => {
    return forge.util.hexToBytes(hex);
}

const avalancheEffect = (originalText, key1, key2) => {
    let changedBits1 = changedBits2 = changedBits3 = 0;
    let enc1_1 = encrypt(originalText, key1);
    const encryptedText1_1 = hexToBinary(enc1_1.toHex());
    let enc1_2 = encrypt(enc1_1, key2);
    const encryptedText1_2 = hexToBinary(enc1_2.toHex());
    let enc1_3 = encrypt(enc1_2, key1);
    const encryptedText1_3 = hexToBinary(enc1_3.toHex());

    let stringWithOneBitChanged = convertBinaryToString(invertLastBit(convertStringToBinary(originalText)));

    let enc2_1 = encrypt(stringWithOneBitChanged, key1);
    const encryptedText2_1 = hexToBinary(enc2_1.toHex());
    let enc2_2 = encrypt(enc2_1, key2);
    const encryptedText2_2 = hexToBinary(enc2_2.toHex());
    let enc2_3 = encrypt(enc2_2, key1);
    const encryptedText2_3 = hexToBinary(enc2_3.toHex());

    for (let i = 0; i < encryptedText1_1.length; i++) {
        if (encryptedText1_1[i] !== encryptedText2_1[i])
            changedBits1++;
    }
    for (let i = 0; i < encryptedText1_2.length; i++) {
        if (encryptedText1_2[i] !== encryptedText2_2[i])
            changedBits2++;
    }
    for (let i = 0; i < encryptedText1_3.length; i++) {
        if (encryptedText1_3[i] !== encryptedText2_3[i])
            changedBits3++;
    }

    const avalancheEffect1 = changedBits1 / encryptedText1_1.length * 100;
    const avalancheEffect2 = changedBits2 / encryptedText1_2.length * 100;
    const avalancheEffect3 = changedBits3 / encryptedText1_3.length * 100;
    
    return {
        step1: avalancheEffect1,
        step2: avalancheEffect2,
        step3: avalancheEffect3,
        stringChanged: stringWithOneBitChanged
    };
}

const invertLastBit = (binaryString) => {
    const lastBit = binaryString[binaryString.length - 1];
    const invertedLastBit = lastBit === "0" ? "1" : "0";
    return binaryString.slice(0, -1) + invertedLastBit;
}


const convertStringToBinary = (str) => {
    let binaryString = "";
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i).toString(2);
        charCode = charCode.length < 8 ? charCode.padStart(8, '0') : charCode;
        binaryString += charCode;
    }

    return binaryString;
}

const convertBinaryToString = (binaryString) => {
    let text = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        const byte = binaryString.slice(i, i + 8);
        const charCode = parseInt(byte, 2);
        const char = String.fromCharCode(charCode);
        text += char;
    }
    return text;
}

module.exports = {encrypt, decrypt, textToBytes, hexStringToBytes, avalancheEffect, EEE2Encrypt, EEE2Decrypt}