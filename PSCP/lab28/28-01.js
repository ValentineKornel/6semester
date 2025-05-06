const express = require('express')
const swaggerUi = require('swagger-ui-express');
const openapidoc = require('./openapi.json');
const fs = require('fs');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapidoc));

const FILE_PATH = './phonebook.json';

const loadPhonebook = () => {
    try {
        const data = fs.readFileSync(FILE_PATH);
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

app.get('/TS', (req, res) => {
    const phonebook = loadPhonebook();
    res.json(phonebook);
});

app.post('/TS', (req, res) => {
    const { name, phone } = req.body;
    if (!name || !phone) {
        return res.status(400).send("Phone and name required");
    }
    const phonebook = loadPhonebook();
    const id = phonebook.length ? phonebook[phonebook.length - 1].id + 1 : 1;
    phonebook.push({ id, name, phone });
    fs.writeFileSync(FILE_PATH, JSON.stringify(phonebook, null, 2));
    res.status(201).send(`Phone ${name} added!`);
});

app.put('/TS', (req, res) => {
    const { id, name, phone } = req.body;
    const phonebook = loadPhonebook();
    const entry = phonebook.find(e => e.id === parseInt(id));
    if (!entry) {
        return res.status(404).send("Element not found");
    }
    entry.name = name ? name : entry.name ;
    entry.phone = phone ? phone : entry.phone;
    fs.writeFileSync(FILE_PATH, JSON.stringify(phonebook, null, 2));
    res.send(`Reconrd ${id} updated: ${entry.name}, ${entry.phone}`);
});

app.delete('/TS', (req, res) => {
    const { id } = req.query;
    let phonebook = loadPhonebook();
    const index = phonebook.findIndex(e => e.id === parseInt(id));
    if (index === -1) {
        return res.status(404).send("Element not found");
    }
    phonebook.splice(index, 1);
    fs.writeFileSync(FILE_PATH, JSON.stringify(phonebook, null, 2));
    res.send(`Record ${id} deleted!`);
});

app.listen(3000, () => console.log('Swagger awailable at http://localhost:3000/api-docs'));
