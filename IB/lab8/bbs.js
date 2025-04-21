const isPrime =  require('prime-number');
const GCD = require('compute-gcd');

const generatePRS = (p, q, quantity) => {
    validateInput(p, q);
    let numbers = [];
    let bits = '';

    let n = p * q;
    let x;
    for(i = 3; i < n;i++){
        let res = GCD(i, n);
        if(res === 1){
            x = i; break;
        }
    }

    let startTime = performance.now();
    let x0 = (x ** 2) % n;
    numbers.push(x0);
    for (i = 1; i < quantity; i++){
        x = (numbers[i - 1] ** 2) % n;
        numbers.push(x);
        bits += String(x & 1);
    }
    let endTime = performance.now();
    const generationTime = (endTime - startTime).toFixed(4);

    return {
        numbers: numbers,
        bits: bits,
        generationTime: generationTime
    }
}

const validateInput = (p, q) => {
    if(!isPrime(p) || !isPrime(q)){
        throw new BadParamsError("Числа p и q должны быть простыми");
    }
    if(p % 4 !== 3 || q % 4 !== 3){
        throw new BadParamsError("Числа p и q должны равняться 3 по модулю 4");
    }
    return true;
}

class BadParamsError extends Error{
    constructor(message){
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    };
}

module.exports = {generatePRS, BadParamsError};