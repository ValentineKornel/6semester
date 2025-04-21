import * as fs from 'fs';
import path from 'path';
import XLSXChart from "xlsx-chart";
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const xlsxChart = new XLSXChart();

const Operation = {
    ENCRYPT: 'ENCRYPT',
    DECRYPT: 'DECRYPT'
};


class Enigma{
    ALPHABET = "abcdefghijklmnopqrstuvwxyz";
    R_ROTOR = "esovpzjayquirhxlnftgkdcmwb";
    M_ROTOR = "ajdksiruxblhwtmcqgznpyfvoe";
    L_ROTOR = "fkqhtlxocbjspdzramewniuygv";
    REFLECTOR = {
        a: 'y', b: 'r', c: 'u', d: 'h', e: 'q', f: 's',
        g: 'l', h: 'd', i: 'p', j: 'x', k: 'n', l: 'g',
        m: 'o', n: 'k', o: 'm', p: 'i', q: 'e', r: 'b',
        s: 'f', t: 'z', u: 'c', v: 'w', w: 'v', x: 'j',
        y: 'a', z: 't'
    }

    ROTOR_LENGTH = this.ALPHABET.length;

    L_SHIFT = 1;
    M_SHIFT = 0;
    R_SHIFT = 1;


    lCurrentPosition = 0;
    mCurrentPosition = 0;
    rCurrentPosition = 0;

    constructor(lCurrentPosition = 0, mCurrentPosition = 0, rCurrentPosition = 0) {
        this.lCurrentPosition = lCurrentPosition;
        this.mCurrentPosition = mCurrentPosition;
        this.rCurrentPosition = rCurrentPosition;
    }

    encrypt = (text) => {
        let result = "";
        for (let s of text) {
            if (this.ALPHABET.includes(s)) {
                let afterDirect = this.directPath(s, Operation.ENCRYPT);
                let afterReflector = this.reflectLetter(afterDirect);
                result += this.reversePath(afterReflector, Operation.ENCRYPT);
                this.shiftRotors();
            }
        }
        return result;
    }

    decrypt = (encryptedText) => {
        let result = "";
        for (let s of encryptedText) {
            if (this.ALPHABET.includes(s)) {
                let afterDirect = this.directPath(s, Operation.DECRYPT);
                let afterReflector = this.reflectLetter(afterDirect);
                result += this.reversePath(afterReflector, Operation.DECRYPT);
                this.shiftRotors();
            }
        }
        return result;
    }


    directPath = (letter, operation) => {
        let afterRight;
        let afterMiddle
        switch (operation) {
            case Operation.ENCRYPT:
                afterRight = this.rotorEncrypt(letter, this.ALPHABET, this.R_ROTOR, this.rCurrentPosition);
                afterMiddle = this.rotorEncrypt(afterRight, this.ALPHABET, this.M_ROTOR, this.mCurrentPosition);
                return this.rotorEncrypt(afterMiddle, this.ALPHABET, this.L_ROTOR, this.lCurrentPosition);
            case Operation.DECRYPT:
                afterRight = this.rotorDecrypt(letter, this.ALPHABET, this.R_ROTOR, this.rCurrentPosition);
                afterMiddle = this.rotorDecrypt(afterRight, this.ALPHABET, this.M_ROTOR, this.mCurrentPosition);
                return this.rotorDecrypt(afterMiddle, this.ALPHABET, this.L_ROTOR, this.lCurrentPosition);
        }
    }

    reversePath = (letter, operation) => {
        let afterLeft;
        let afterMiddle
        switch (operation) {
            case Operation.ENCRYPT:
                afterLeft = this.rotorEncrypt(letter, this.L_ROTOR, this.ALPHABET, this.lCurrentPosition);
                afterMiddle = this.rotorEncrypt(afterLeft, this.M_ROTOR, this.ALPHABET, this.mCurrentPosition);
                return this.rotorEncrypt(afterMiddle, this.R_ROTOR, this.ALPHABET, this.rCurrentPosition);
            case Operation.DECRYPT:
                afterLeft = this.rotorDecrypt(letter, this.L_ROTOR, this.ALPHABET, this.lCurrentPosition);
                afterMiddle = this.rotorDecrypt(afterLeft, this.M_ROTOR, this.ALPHABET, this.mCurrentPosition);
                return this.rotorDecrypt(afterMiddle, this.R_ROTOR, this.ALPHABET, this.rCurrentPosition);
        }
    }

    shiftRotors = () => {
        //return;
        this.lCurrentPosition = (this.lCurrentPosition + this.L_SHIFT) % this.ROTOR_LENGTH;
        this.rCurrentPosition = (this.rCurrentPosition + this.R_SHIFT) % this.ROTOR_LENGTH;
        if(this.rCurrentPosition === 0){
            console.log('mid shift')
            this.mCurrentPosition = (this.mCurrentPosition + this.M_SHIFT) % this.ROTOR_LENGTH;
        }
    }

    rotorEncrypt = (letter, originalAlphabet, encryptionAlphabet, currentOffset) => {
        let originalIndex = originalAlphabet.indexOf(letter);
        return encryptionAlphabet[(originalIndex + currentOffset) % this.ROTOR_LENGTH];
    }

    // rotorDecrypt = (letter, originalAlphabet, encryptionAlphabet, currentOffset) => {
    //     let originalIndex = originalAlphabet.indexOf(letter);
    //     return encryptionAlphabet[(originalIndex - currentOffset + this.ROTOR_LENGTH) % this.ROTOR_LENGTH];
    // }

    rotorDecrypt = (letter, encryptionAlphabet, originalAlphabet, currentOffset) => {
        let encryptedIndex = encryptionAlphabet.indexOf(letter);
        return originalAlphabet[(encryptedIndex - currentOffset + this.ROTOR_LENGTH) % this.ROTOR_LENGTH];
    }
    

    reflectLetter = (letter) => {
        return this.REFLECTOR[letter];
    }
}

export const calculateSymbolsFrequency = (file, alphabet) => {
    let contents = fs.readFileSync(file, {encoding: "utf-8"});
    contents = contents.toLowerCase();

    let resultFrequency = {};
    let symbolsCount = 0;

    for (let i = 0; i < contents.length; i++) {
        let symbol = contents[i];
        if (alphabet.includes(symbol)) {
            if (symbol in resultFrequency) {
                resultFrequency[symbol]++;
            } else {
                resultFrequency[symbol] = 1;
            }
            symbolsCount++;
        }
    }
    return {symbolsCount: symbolsCount, resultFrequency: resultFrequency};
}

export const exportHistogram = async (file, frequency, alphabet) => {
    const opts = {
        chart: "column",
        titles: [
            "Частота"
        ],
        fields: alphabet,
        data: {
            "Частота": frequency
        },
        chartTitle: "Частота появления символов в алфавите"
    };

    await xlsxChart.generate(opts, (err, data) => {
            if (err) {
                console.error(err);
            } else {
                fs.writeFileSync(path.join(__dirname, 'charts', file), data);
                //console.log("Chart created.");
            }
        }
    );
}

export default Enigma;