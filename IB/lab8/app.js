const express =  require('express');
const {generatePRS, BadParamsError} = require('./bbs');
const { encryptRC4 } = require("./rc4");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.set('view engine', 'ejs');

app.get("/", (req, res) => {
    res.redirect('/bbs');
});

app.get("/bbs", (req, res) => {
    res.render('bbs');
});

app.get("/rc4", (req, res) => {
    res.render('rc4');
});

app.post("/bbs", (req, res) => {
    let p = Number(req.body.p);
    let q = Number(req.body.q);
    let quantity = Number(req.body.quantity);
    
    try{
        let {numbers, bits, generationTime} = generatePRS(p, q, quantity); //23 31
        return res.status(200).json({
            numbers: numbers,
            bits: bits,
            generationTime: generationTime
        });
    }catch(error){
        if(error instanceof BadParamsError){
            return res.status(400).json({message: error.message});
        }else{
            return res.status(500);
        }
    }
});

app.post("/rc4/encrypt", (req, res) => {
    let input = req.body.input;

    let startTime = performance.now();
    const encrypted = encryptRC4(input).toString('hex');
    let endTime = performance.now();
    const encodingTime = (endTime - startTime).toFixed(4);

    res.status(200).json({
        encrypted: encrypted,
        encodingTime: encodingTime
    });
});

app.post("/rc4/decrypt", (req, res) => {
    let input = req.body.input;
    const buffer = Buffer.from(input, 'hex');

    let startTime = performance.now();
    const decrypted = encryptRC4(buffer).toString('utf8');
    let endTime = performance.now();
    const decodingTime = (endTime - startTime).toFixed(4);

    res.status(200).json({
        decrypted: decrypted,
        decodingTime: decodingTime
    });
});


app.listen(3000, () => console.log(`Server is running at http://localhost:3000`));