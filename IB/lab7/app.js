const express =  require('express');
const {avalancheEffect, decrypt, encrypt, textToBytes, hexStringToBytes, EEE2Encrypt, EEE2Decrypt} = require("./des");
const {Bytes} = require("node-forge");
const forge = require('node-forge');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.render('des');
});

let originalText = '';

app.post("/encrypt", (req, res) => {

    originalText = req.body.enc_text;

    let startTime = performance.now();
    const encryptedText = EEE2Encrypt(req.body.enc_text, req.body.key1, req.body.key2);
    const result = encryptedText.toHex();
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    res.status(200).json({
        encrypted: result,
        encodingTime: encodingTime
    });
});

app.post("/decrypt", (req, res) => {

    let startTime = performance.now(); 
    const decryptedText = EEE2Decrypt(req.body.dec_text, req.body.key1, req.body.key2);
    endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    const avalanche = avalancheEffect(originalText, req.body.key1, req.body.key2);

    res.status(200).json({
        avalanche: avalanche,
        decrypted: decryptedText.toString(),
        decodingTime: decodingTime,
    });
});


app.listen(3000, () => console.log(`Server is running at http://localhost:3000`));