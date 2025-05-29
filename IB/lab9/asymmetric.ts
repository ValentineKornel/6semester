import bigInt, {BigInteger} from 'big-integer';
import {generateCoprime, getInverseNumber} from "./mathUtils";
import {base64Encode, convertBase64ToBinary} from "./base64";

export enum Encoding {
    ASCII,
    BASE64
}

export const generatePrivateKey = (initialNumber: BigInteger, z: number): BigInteger[] => {
    const sequence: BigInteger[] = [];
    let element: BigInteger = initialNumber;
    let sum = initialNumber;

    for (let i = 0; i < z; i++) {
        sequence.push(element);
        element = sum.add(bigInt(z));
        sum = sum.add(element);
    }

    return sequence;
}

export const getPublicKeyParams = (privateKey: BigInteger[]): {a: bigInt.BigInteger, n: bigInt.BigInteger} => {
    const sum = privateKey.reduce((prev, curr) => prev.plus(curr));
    const n = bigInt(sum).add(1n);
    const a = generateCoprime(n);
    return {a, n};
}

export const generatePublicKey = (privateKey: BigInteger[], a: BigInteger, n: BigInteger): BigInteger[] => {
    const sequence: BigInteger[] = [];
    let d: BigInteger;
    let e: BigInteger;

    for (let i = 0; i < privateKey.length; i++) {
        d = privateKey[i];
        e = d.multiply(a).mod(n);
        sequence.push(e);
    }

    return sequence;
}

export const encrypt = (publicKey: bigInt.BigInteger[], plaintext: string, encoding: Encoding): bigInt.BigInteger[] => {
    const encryptedList: bigInt.BigInteger[] = [];

    if (encoding === Encoding.BASE64) {
        plaintext = base64Encode(plaintext);
    }

    plaintext.split('').forEach((b, index) => {
        let binaryString;
        if (encoding === Encoding.ASCII) {
            binaryString = plaintext.charCodeAt(index).toString(2).padStart(8, '0');
        } else  {
            binaryString = convertBase64ToBinary(plaintext[index]);
        }

        const positions: number[] = [];
        for (let i = 0; i < binaryString.length; i++) {
            if (binaryString[i] === '1') {
                positions.push(i);
            }
        }

        let sum = bigInt.zero;
        positions.forEach(position => {
            if (position < publicKey.length) {
                sum = sum.add(publicKey[position]);
            }
        });

        encryptedList.push(sum);
    });

    return encryptedList;
}

export const encrypt2 = (
    publicKey: bigInt.BigInteger[],
    plaintext: string,
    encoding: Encoding
): bigInt.BigInteger[] => {
    const encryptedList: bigInt.BigInteger[] = [];

    if (encoding === Encoding.BASE64) {
        plaintext = base64Encode(plaintext);
    }

    // Обрабатываем по 2 символа (16 бит)
    for (let i = 0; i < plaintext.length; i += 2) {
        const char1 = plaintext.charCodeAt(i);
        const char2 = i + 1 < plaintext.length ? plaintext.charCodeAt(i + 1) : 0; // добавим 0 если нечетное кол-во

        const combined = (char1 << 8) | char2; // Объединение в 16-битное число
        const binaryString = combined.toString(2).padStart(16, '0');

        const positions: number[] = [];
        for (let j = 0; j < binaryString.length; j++) {
            if (binaryString[j] === '1') {
                positions.push(j);
            }
        }

        let sum = bigInt.zero;
        positions.forEach(position => {
            if (position < publicKey.length) {
                sum = sum.add(publicKey[position]);
            }
        });

        encryptedList.push(sum);
    }

    return encryptedList;
}


export const decrypt = (privateKey: BigInteger[], encryptedText: BigInteger[], a: BigInteger, n: BigInteger): {decoded: Uint8Array, binary: string} => {
    let decryptedBytes: number[] = [];
    let binaryResult: string = "";
    let inverse: BigInteger = getInverseNumber(a, n);
    for (let cipher of encryptedText) {
        let decryptedValue: BigInteger = cipher.times(inverse).mod(n);
        let binaryString: string = getDecryptedBinary(decryptedValue, privateKey);
        binaryResult += binaryString;
        let decryptedByte: number = parseInt(binaryString, 2);
        decryptedBytes.push(decryptedByte);
    }

    return {decoded: new Uint8Array(decryptedBytes), binary: binaryResult};
}

export const decrypt2 = (
    privateKey: BigInteger[],
    encryptedText: BigInteger[],
    a: BigInteger,
    n: BigInteger
): { decoded: Uint8Array, binary: string } => {
    let decryptedBytes: number[] = [];
    let binaryResult: string = "";
    let inverse: BigInteger = getInverseNumber(a, n);

    for (let cipher of encryptedText) {
        let decryptedValue: BigInteger = cipher.multiply(inverse).mod(n);
        let binaryString: string = getDecryptedBinary(decryptedValue, privateKey).padStart(16, '0');
        binaryResult += binaryString;

        // разбиваем 16 бит на два байта
        const highByte = parseInt(binaryString.slice(0, 8), 2);
        const lowByte = parseInt(binaryString.slice(8, 16), 2);
        decryptedBytes.push(highByte);
        decryptedBytes.push(lowByte);
    }

    // Удаляем возможный последний лишний байт (если был добавлен 0 при нечетном количестве символов)
    if (decryptedBytes[decryptedBytes.length - 1] === 0) {
        decryptedBytes.pop();
    }

    return { decoded: new Uint8Array(decryptedBytes), binary: binaryResult };
};


export const getDecryptedBinary = (number: BigInteger, privateKey: BigInteger[]): string => {
    let binaryString = '';

    for (let i = privateKey.length - 1; i >= 0; i--) {
        if (number.greaterOrEquals(privateKey[i])) {
            binaryString += '1';
            number = number.minus(privateKey[i]);
        } else {
            binaryString += '0';
        }
    }

    return binaryString.split('').reverse().join('');
}