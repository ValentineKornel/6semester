const express = require('express');
const cors = require('cors');
const fs = require('fs');
const app = express();
app.use(cors());

app.use(express.static('.', { setHeaders: (res, path) => {
    if (path.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
    }
}}));

app.get('/', async (req, res) => {
    return res.end(fs.readFileSync('./wasm.html'))
})


app.listen(3000, () => console.log('Server started at port 3000'));