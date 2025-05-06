const express = require('express');
const cors = require('cors');
const path = require('path')
const fs = require('fs')
const app = express();

async function loadWasm() {
    const buffer = fs.readFileSync('./p.wasm');
    const wasmModule = await WebAssembly.instantiate(buffer);
    return wasmModule.instance.exports;
}

let wasmExports;

app.get('/:operation/:a/:b', async (req, res) => {
    try {
        
        let { operation, a, b } = req.params;

        let operations = {
            sum: wasmExports.sum,
            mul: wasmExports.mul,
            sub: wasmExports.sub
        };

        if (!operations[operation]) {
            return res.status(400).send('Inalid operation');
        }

        const result = operations[operation](parseInt(a), parseInt(b));
        res.send(`Result: ${result}`);
    } catch (error) {
        res.status(500).send(`Error handling WASM ${error.message}`);
    }
});

app.listen(3000, async () => {wasmExports = await loadWasm(); console.log('Server started at port 3000')});
