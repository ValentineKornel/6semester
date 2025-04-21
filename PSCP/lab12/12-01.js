const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const rpcWSS = require('rpc-websockets').Server;

let rpcServer = new rpcWSS({port: 4000, host: 'localhost'});

rpcServer.event('backupChange');

let server;
let backupDir = './';
let filePath = 'StudentList.json';
let watchedFiles = new Set();
let lastChangeTime = 0;

function watchFile(filePath) {
    if (!watchedFiles.has(filePath)) {
        fs.watch(filePath, (eventType, filename) => {
            let currentTime = Date.now();
            if (eventType === 'change' && currentTime - lastChangeTime > 100) {
                console.log(`file ${filename} was changed`);
                rpcServer.emit('backupChange', `file ${filename} was changed`);
                lastChangeTime = currentTime;
            }
        });
        watchedFiles.add(filePath);
    }
}

function watchBackupDir() {
    fs.readdir(backupDir, (err, files) => {
        if (err) {
            console.error('Error reading backup directory:', err);
            return;
        }
        const backupFiles = files.filter(file => /^(\d{14})_StudentList\.json$/.test(file));

        backupFiles.forEach(file => {
            let filePath = path.join(backupDir, file);
            watchFile(filePath);
        });
    });

    fs.watch(backupDir, (eventType, filename) => {
        if (eventType === 'rename' && filename && /^(\d{14})_StudentList\.json$/.test(filename)) {
            let filePath = path.join(backupDir, filename);
            console.log(`File ${filename} was added or deleted`);

            watchFile(filePath);
        }
    });
}


watchBackupDir();

server = http.createServer(function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);
    let match = pathName.match(/^\/(\d+)$/)

    if(pathName == '/' && req.method == 'GET'){
        
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if(err){
                resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'500', message: `Error reading file ${filePath}`}));
            }

            resp.writeHead(200, {'Content-Type': 'application/json'});
            resp.end(data);
        });
    }
    else if(match && req.method == 'GET'){
        let requestedId = parseInt(match[1], 10);

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if(err){
                resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'500', message: `Error reading file ${filePath}`}));
            }

            try{
                let jsonArray = JSON.parse(data);
                let foundObject = jsonArray.find(item => item.id === requestedId);

                if(foundObject){
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(foundObject));
                }else{
                    resp.writeHead(404, {'Content-Type': 'applicatoin/json'});
                    resp.end(JSON.stringify({error: '404', message: `student with id ${requestedId} not found`}));
                }

            } catch(parseError){
                console.log(parseError.message);
                resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'500', message: `Error parsing JSON`}));
            }
            
        });
    }
    else if(pathName == '/' && req.method == 'POST'){
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try{
                let newStudent = JSON.parse(body);

                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if(err){
                        resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                        resp.end(JSON.stringify({error:'500', message: `Error reading file ${filePath}`}));
                    }
        
                    try{
                        let jsonArray = JSON.parse(data);
                        let foundObject = jsonArray.find(item => item.id === newStudent.id);

                        if(!foundObject){
                            jsonArray.push(newStudent);

                            fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), (err) => {
                                if(err){
                                    resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                                    resp.end(JSON.stringify({error:'500', message: `Error writing to file ${filePath}`}));
                                }
                            })

                            resp.writeHead(201, {'Content-Type': 'applicatoin/json'});
                            resp.end(JSON.stringify(newStudent));
                        }else{
                            resp.writeHead(409, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify({error: '409', message: `Student with id ${newStudent.id} already exists`}));
                        }
        
                    } catch(parseError){
                        console.log(parseError.message);
                        resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                        resp.end(JSON.stringify({error:'500', message: 'Error parsing JSON'}));
                    }
                });
            }catch(parseError){
                console.log(parseError.message);
                resp.writeHead(400, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'400', message: 'Wrong request body format'}));
            }
        })
    }
    else if(pathName == '/' && req.method == 'PUT'){
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });

        req.on('end', () => {
            try{
                let newStudent = JSON.parse(body);

                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if(err){
                        resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                        resp.end(JSON.stringify({error:'500', message: `Error reading file ${filePath}`}));
                    }
        
                    try{
                        let jsonArray = JSON.parse(data);
                        let index = jsonArray.findIndex(item => item.id === newStudent.id);

                        if(index !== -1){
                            jsonArray[index] = newStudent;

                            fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), (err) => {
                                if(err){
                                    resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                                    resp.end(JSON.stringify({error:'500', message: `Error writing to file ${filePath}`}));
                                }
                            })

                            resp.writeHead(200, {'Content-Type': 'applicatoin/json'});
                            resp.end(JSON.stringify(newStudent));
                        }else{
                            resp.writeHead(404, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify({error: '404', message: `Student with id ${newStudent.id}  not found`}));
                        }
        
                    } catch(parseError){
                        console.log(parseError.message);
                        resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                        resp.end(JSON.stringify({error:'500', message: 'Error parsing JSON'}));
                    }
                });
            }catch(parseError){
                console.log(parseError.message);
                resp.writeHead(400, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'400', message: 'Wrong request body format'}));
            }
        })

    }
    else if(match && req.method == 'DELETE'){
        let requestedId = parseInt(match[1], 10);
        let removedStudent = null;

        fs.readFile(filePath, 'utf-8', (err, data) => {
            if(err){
                resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'500', message: `Error reading file ${filePath}`}));
            }

            try{
                let jsonArray = JSON.parse(data);
                let index = jsonArray.findIndex(item => item.id === requestedId);

                if(index !== -1){
                    removedStudent = jsonArray.splice(index, 1)[0];

                    fs.writeFile(filePath, JSON.stringify(jsonArray, null, 2), (err) => {
                        if(err){
                            resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                            resp.end(JSON.stringify({error:'500', message: `Error writing to file ${filePath}`}));
                        }
                    })

                    resp.writeHead(200, {'Content-Type': 'applicatoin/json'});
                    resp.end(JSON.stringify(removedStudent));
                }else{
                    resp.writeHead(404, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify({error: '404', message: `Student with id ${requestedId} not found`}));
                }

            } catch(parseError){
                console.log(parseError.message);
                resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                resp.end(JSON.stringify({error:'500', message: 'Error parsing JSON'}));
            }
        });

    }
    else if(pathName == '/backup' && req.method == 'POST'){
        let currentDate = new Date();
        let formattedDate = currentDate.getFullYear() +
            String(currentDate.getMonth() + 1).padStart(2, '0') +
            String(currentDate.getDate()).padStart(2, '0') +
            String(currentDate.getHours()).padStart(2, '0') +
            String(currentDate.getSeconds()).padStart(2, '0');

        let targetFilePath = `${formattedDate}_StudentList.json`;

        setTimeout(() => {

            fs.copyFile(filePath, targetFilePath, (err) => {
                if(err){
                    console.log(`Error copying the file ${filePath} to ${targetFilePath}`);
                    //resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                    //resp.end(JSON.stringify({error:'500', message: `Error copying the file ${filePath} to ${targetFilePath}`}));
                }

                // resp.writeHead(200, {'Content-Type': 'applicatoin/json'});
                // resp.end(JSON.stringify({message: `file successfully copied as ${targetFilePath}`}));
            });
        }, 2000);
        resp.writeHead(202);
        resp.end();
    }
    else if(pathName.startsWith('/backup') && req.method == 'DELETE'){
        let backupDir = './';
        let deletionDate = req.url.split('/')[2];

        let dateRegex = /^\d{8}$/;
        if (!dateRegex.test(deletionDate)) {
            resp.writeHead(400, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify({ error:'400', message: 'Incorrect date format! Use YYYYMMDD' }));
        }

        let targetDate = deletionDate;
        let formattedDate = targetDate.slice(0, 4) + targetDate.slice(6, 8) + targetDate.slice(4, 6);
        targetDate = formattedDate;

        fs.readdir(backupDir, (err, files) => {
            if (err) {
                resp.writeHead(500, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({ error:'500', message: 'Error reading backup directory'}));
                return;
            }

            let filesToDelete = files.filter(file => {
                let match = file.match(/^(\d{8})\d{4}_StudentList\.json$/);
                return match && match[1] < targetDate;
            });
            console.log(`file to delete found ${filesToDelete.length}`);

            if(filesToDelete.length > 0){
                filesToDelete.forEach(file => {
                    let delFilePath = path.join(backupDir, file);
                    fs.unlink(delFilePath, (err) => {
                        if(err){
                            resp.writeHead(500, {'Content-Type': 'applicatoin/json'});
                            resp.end(JSON.stringify({error:'500', message: `Error deleting the file ${delFilePath}`}));
                        }
                    })
                })
            }
            resp.writeHead(200);
            resp.end();
        });
    }
    else if(pathName == '/backup' && req.method == 'GET'){
        fs.readdir(backupDir, (err, files) => {
            if (err) {
                resp.writeHead(500, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({ error:'500', message: 'Error reading backup directory'}));
                return;
            }

            let backupFiles = files.filter(file => /^(\d{14})_StudentList\.json$/.test(file));

            resp.writeHead(200, { 'Content-Type': 'application/json' });
            resp.end(JSON.stringify(backupFiles));
        });
    }
    else{
        resp.writeHead(404, {'Content-Type': 'applicatoin/json'});
        resp.end(JSON.stringify({error: '404', message: 'URL not found'}));
    }
});

server.listen(5000);