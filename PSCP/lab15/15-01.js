const http = require('http');
const path = require('path');
const url = require('url');
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log('MongoDB: connected successfully');
    } catch (err) {
        console.log('MongoDB: error', err);
    }
}

run();


let server = http.createServer(async function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/api/faculties' && req.method == 'GET'){
        let collection = client.db('bstu').collection('faculty');
        let docs = await collection.find({}).toArray();
        resp.writeHead(200, {'Content-Type': 'application/json'});
        resp.end(JSON.stringify(docs));
        return;
    }
    else if(pathName == '/api/pulpits' && req.method == 'GET'){
        let collection = client.db('bstu').collection('pulpit');
        let docs = await collection.find({}).toArray();
        resp.writeHead(200, {'Content-Type': 'application/json'});
        resp.end(JSON.stringify(docs));
    }
    else if(pathName == '/api/faculties' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end',async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.faculty && jsonObj.faculty_name){
                    let element = await client.db('bstu').collection('faculty').findOne({faculty: jsonObj.faculty});
                    if(element){
                        resp.writeHead(409, { 'Content-Type': 'application/json' });
                        return resp.end(JSON.stringify({message: 'Element dublicate'}));
                    }

                    let inserted = await client.db('bstu').collection('faculty').insertOne({faculty:jsonObj.faculty, faculty_name: jsonObj.faculty_name});
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(data);
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/pulpits' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end',async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.pulpit && jsonObj.pulpit_name && jsonObj.faculty){
                    let element = await client.db('bstu').collection('pulpit').findOne({pulpit: jsonObj.pulpit});
                    if(element){
                        resp.writeHead(409, { 'Content-Type': 'application/json' });
                        return resp.end(JSON.stringify({message: 'Element dublicate'}));
                    }
                    let fc = await client.db('bstu').collection('faculty').findOne({faculty: jsonObj.faculty});
                    if(!fc){
                        resp.writeHead(500, { 'Content-Type': 'application/json' });
                        return resp.end(JSON.stringify({message: `Faculty ${jsonObj.faculty} doesn't exist`}));
                    }

                    let inserterd = await client.db('bstu').collection('pulpit').insertOne({pulpit:jsonObj.pulpit, pulpit_name:jsonObj.pulpit_name, faculty:jsonObj.faculty});
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(data);
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/faculties' && req.method == 'PUT'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end',async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.faculty && jsonObj.faculty_name){
                    let element = await client.db('bstu').collection('faculty').findOne({faculty: jsonObj.faculty});
                    if(!element){
                        resp.writeHead(404, { 'Content-Type': 'application/json' });
                        return resp.end(JSON.stringify({message: 'Element Not found'}));
                    }

                    let updated = await client.db('bstu').collection('faculty').updateOne({faculty:jsonObj.faculty}, {$set:{faculty_name: jsonObj.faculty_name}});
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(data);
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/pulpits' && req.method == 'PUT'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end',async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.pulpit && jsonObj.pulpit_name && jsonObj.faculty){
                    let element = await client.db('bstu').collection('pulpit').findOne({pulpit: jsonObj.pulpit});
                    if(!element){
                        resp.writeHead(404, { 'Content-Type': 'application/json' });
                        return resp.end(JSON.stringify({message: 'Element Not found'}));
                    }
                    let fc = await client.db('bstu').collection('faculty').findOne({faculty: jsonObj.faculty});
                    if(!fc){
                        resp.writeHead(500, { 'Content-Type': 'application/json' });
                        return resp.end(JSON.stringify({message: `Faculty ${jsonObj.faculty} doesn't exist`}));
                    }

                    let inserted = await client.db('bstu').collection('pulpit').updateOne({pulpit:jsonObj.pulpit}, {$set:{pulpit_name: jsonObj.pulpit_name, faculty:jsonObj.faculty}});
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(data);
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName.startsWith('/api/faculties') && req.method == 'DELETE'){

        let regex = /^\/api\/faculties\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let faculty = decodeURIComponent(matches[1]);
            try{
                let deleted = await client.db('bstu').collection('faculty').findOne({faculty:faculty});
                let deletedPulpits = await client.db('bstu').collection('pulpit').find({faculty:faculty}).toArray();
                console.log(deletedPulpits.length);
                if(deletedPulpits.length > 0){
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    return resp.end(JSON.stringify({message: 'Foreign key error. delete related pulpits first'}));
                }
                if(!deleted){
                    resp.writeHead(404, { 'Content-Type': 'application/json' });
                    return resp.end(JSON.stringify({message: 'Element Not found'}));
                }
                await client.db('bstu').collection('faculty').deleteOne({faculty:faculty});
                resp.writeHead(200, {'Content-Type': 'application/json'});
                resp.end(JSON.stringify(deleted));
            }catch(err){
                resp.writeHead(500, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '500', message: err.message}));
            }
        }
    }
    else if(pathName.startsWith('/api/pulpits') && req.method == 'DELETE'){

        let regex = /^\/api\/pulpits\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let pulpit = decodeURIComponent(matches[1]);
            try{
                let deleted = await client.db('bstu').collection('pulpit').findOne({pulpit:pulpit});
                if(!deleted){
                    resp.writeHead(404, { 'Content-Type': 'application/json' });
                    return resp.end(JSON.stringify({message: 'Element Not found'}));
                }

                await client.db('bstu').collection('pulpit').deleteOne({pulpit:pulpit});
                resp.writeHead(200, {'Content-Type': 'application/json'});
                resp.end(JSON.stringify(deleted));
            }catch(err){
                resp.writeHead(500, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '500', message: err.message}));
            }
        }
    }
    else{
        resp.writeHead(404, {'Content-Type': 'application/json'});
        resp.end(JSON.stringify({error: '404', message: 'URL not found'}));
    }
});



server.listen(3000, '127.0.0.1', () => {
    console.log("Server listening on localhost:3000");
})

