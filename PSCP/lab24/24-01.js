import express from 'express';
import { createClient } from 'webdav';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const upload = multer();
const app = express();
const PORT = 3000;
const username = "valentine.korneliuk17@gmail.com";
const password = "dwmf6ra4lau3tvbh";
const koofrUrl = `https://app.koofr.net/dav`;
const client = createClient(koofrUrl, { username, password });

app.use(express.text())

app.post('/md/:name', async (req, res) => {
    try {
        await client.createDirectory(`koofr/${req.params.name}`);
        res.send(`Directory "${req.params.name}" created`);
    } catch (error) {
        console.log(error.message);
        res.status(408).send(`Error: Directory already exists`);
    }
});

app.post('/rd/:name', async (req, res) => {
    try {
        await client.deleteFile(`koofr/${req.params.name}`);
        res.send(`Directory "${req.params.name}" deleted`);
    } catch (error) {
        res.status(408).send('Error: Directory not found');
    }
});

app.post('/up/:filename', upload.single('file'), async (req, res) => {
    try {
        console.log(req.file.buffer);

        await client.putFileContents(`koofr/${req.params.filename}`, req.file.buffer);
        res.send(`File "${req.params.filename}" uploaded`);
    } catch (error) {
        console.log(error.message);
        res.status(408).send('Error uploading file');
    }
});

app.post('/down/:filename', async (req, res) => {
    try {
        const localPath = path.join('./', req.params.filename);

        const fileData = await client.getFileContents(`koofr/${req.params.filename}`, { format: 'binary' });
        fs.writeFileSync(localPath, fileData);

        res.send(`File "${req.params.filename}" saved to directory`);
    } catch (error) {
        res.status(404).send('Error: file not found');
    }
});

app.post('/del/:filename', async (req, res) => {
    try {
        await client.deleteFile(`koofr/${req.params.filename}`);
        res.send(`File "${req.params.filename}" deleted`);
    } catch (error) {
        res.status(404).send('Error: file not found');
    }
});

app.post('/copy/:source/:target', async (req, res) => {
    try {
        const fileData = await client.getFileContents(`koofr/${req.params.source}`);
        await client.putFileContents(`koofr/${req.params.target}`, fileData);
        res.send(`File "${req.params.source}" copied to "${req.params.target}"`);
    } catch (error) {
        res.status(404).send('Error: file not found');
    }
});

app.post('/move/:source/:target', async (req, res) => {
    try {
        await client.moveFile(`koofr/${req.params.source}`, `koofr/${req.params.target}/${req.params.source}`);
        res.send(`File "${req.params.source}" moved to "${req.params.target}"`);
    } catch (error) {
        res.status(404).send('Error: file not found');
    }
});


app.listen(PORT, () => {
    console.log(`Server started at port ${PORT}`);
});
