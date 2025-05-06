import express, {Request, Response} from 'express';
import {RSA} from "./rsa";
import {ElGamal} from "./elGamal";
import bigInt, {BigInteger} from 'big-integer';
import {Schnorr} from "./schnorr";

const app = express();
app.use(express.json());
const PORT = 3000;

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.redirect('/rsa');
})

app.get('/rsa', (req: Request, res: Response) => {
    res.render('rsa');
});

app.post('/rsa/sign', (req: Request, res: Response) => {
    const originalText = req.body.message as string;
    const rsa = RSA.getRSA();
    const publicKey = rsa.getPublicKey();

    let startTime = performance.now();
    const digitalSign = rsa.createDigitalSignature(originalText);
    let endTime = performance.now();
    const signTime = endTime - startTime;

    res.json({
        signTime: signTime.toFixed(3),
        publicKey,
        digitalSign
    });
})

app.post('/rsa/verify', (req: Request, res: Response) => {
    const originalText = req.body.message as string;
    const e = bigInt(req.body.e);
    const n = bigInt(req.body.n);
    const digitalSign = bigInt(req.body.sign);
    const rsa = RSA.getRSA();

    let startTime = performance.now();
    const verified = rsa.verifyDigitalSignature(originalText, digitalSign, e, n);
    let endTime = performance.now();
    const verificationTime = endTime - startTime;

    res.json({
        verificationTime: verificationTime.toFixed(3),
        verified
    });
})

app.get('/el-gamal', (req: Request, res: Response) => {
    res.render('el-gamal');
});

app.post('/el-gamal/sign', (req: Request, res: Response) => {
    const originalText = req.body.message as string;

    let startTime = performance.now();
    const elGamal = ElGamal.getElGamal();
    const publicKey = elGamal.getPublicKey();

    const digitalSign = elGamal.createDigitalSignature(originalText);
    let endTime = performance.now();
    const signTime = endTime - startTime;

    res.json({
        signTime: signTime.toFixed(3),
        publicKey,
        digitalSign
    });
})

app.post('/el-gamal/verify', (req: Request, res: Response) => {
    const originalText = req.body.message as string;
    const p = bigInt(req.body.p);
    const g = bigInt(req.body.g);
    const y = bigInt(req.body.y);
    const digitalSignA = bigInt(req.body.signA);
    const digitalSignB = bigInt(req.body.signB);
    const elGamal = ElGamal.getElGamal();

    let startTime = performance.now();
    const verified = elGamal.verifyDigitalSignature(originalText, [digitalSignA, digitalSignB], p, g, y);
    let endTime = performance.now();
    const verificationTime = endTime - startTime;

    res.json({
        verificationTime: verificationTime.toFixed(3),
        verified
    });
})

app.get('/schnorr', (req, res) => {
    res.render('schnorr');
});

app.post('/schnorr/sign', (req: Request, res: Response) => {
    const originalText = req.body.message as string;

    let startTime = performance.now();
    const schnorr = Schnorr.getSchnorr();
    const publicKey = schnorr.getPublicKey();

    const digitalSign = schnorr.generateDigitalSignature(originalText);
    let endTime = performance.now();
    const signTime = endTime - startTime;

    res.json({
        signTime: signTime.toFixed(3),
        publicKey,
        digitalSign
    });
})

app.post('/schnorr/verify', (req: Request, res: Response) => {
    const originalText = req.body.message as string;
    const p = bigInt(req.body.p);
    const g = bigInt(req.body.g);
    const q = bigInt(req.body.q);
    const y = bigInt(req.body.y);
    const digitalSignH = bigInt(req.body.signH);
    const digitalSignB = bigInt(req.body.signB);
    const schnorr = Schnorr.getSchnorr();

    let startTime = performance.now();
    const verified = schnorr.verifyDigitalSignature(originalText, [digitalSignH, digitalSignB], p, g, q, y);
    let endTime = performance.now();
    const verificationTime = endTime - startTime;

    res.json({
        verificationTime: verificationTime.toFixed(3),
        verified
    });
})

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});