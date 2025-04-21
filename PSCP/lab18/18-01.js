const Sequelize = require('sequelize'); //npm install tedious
const sequelize = new Sequelize('NodeLabsDB', 'ValentineNode', '12345', {host:'localhost', dialect:'mssql'});
const {Faculty, Pulpit, Teacher, Subject, Auditorium_type, Auditorium} = require('./18m').ORM(sequelize);
const http = require('http');
const path = require('path');
const url = require('url');

const PORT = '3000';

sequelize.authenticate()
.then(() => console.log('Connection to database is set'))
.catch(err => console.log('Error connecting to database: ', err.message));


let server = http.createServer(async function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/' && req.method == 'GET'){
        resp.writeHead(200, { 'Content-Type': 'text/html' });
        resp.end(fs.readFileSync('./14-02.html'));
    }
    else if(pathName == '/api/faculties' && req.method == 'GET'){
        let faculties = await Faculty.findAll();
        resp.writeHead(200, { 'Content-Type': 'application/json' });
        resp.end(JSON.stringify(faculties.map(f => f.dataValues)));
    }
    else if(pathName == '/api/pulpits' && req.method == 'GET'){
        let pulpits = await Pulpit.findAll();
        resp.writeHead(200, { 'Content-Type': 'application/json' });
        resp.end(JSON.stringify(pulpits.map(p => p.dataValues)));
    }
    else if(pathName == '/api/subjects' && req.method == 'GET'){
        let subjects = await Subject.findAll();
        resp.writeHead(200, { 'Content-Type': 'application/json' });
        resp.end(JSON.stringify(subjects.map(s => s.dataValues)));
    }
    else if(pathName == '/api/auditoriumtypes' && req.method == 'GET'){
        let auditorium_types = await Auditorium_type.findAll();
        resp.writeHead(200, { 'Content-Type': 'application/json' });
        resp.end(JSON.stringify(auditorium_types.map(at => at.dataValues)));
    }
    else if(pathName == '/api/auditoriums' && req.method == 'GET'){
        let auditoriums = await Auditorium.findAll();
        resp.writeHead(200, { 'Content-Type': 'application/json' });
        resp.end(JSON.stringify(auditoriums.map(a => a.dataValues)));
    }
    else if(pathName == '/api/faculties' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.faculty && jsonObj.faculty_name){
                    await Faculty.create({faculty: jsonObj.faculty, faculty_name: jsonObj.faculty_name})
                        .then(newFaculty => {
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify(newFaculty.dataValues));
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        })
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

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.pulpit && jsonObj.pulpit_name && jsonObj.faculty){
                    await Pulpit.create({pulpit: jsonObj.pulpit, pulpit_name: jsonObj.pulpit_name, faculty: jsonObj.faculty})
                        .then(newPulpit => {
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify(newPulpit.dataValues));
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        })
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/subjects' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.subject && jsonObj.subject_name && jsonObj.pulpit){
                    await Subject.create({subject: jsonObj.subject, subject_name: jsonObj.subject_name, pulpit: jsonObj.pulpit})
                        .then(newSubject => {
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify(newSubject.dataValues));
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        })
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/auditoriumtypes' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium_type && jsonObj.auditorium_typename){
                    await Auditorium_type.create({auditorium_type: jsonObj.auditorium_type, auditorium_typename: jsonObj.auditorium_typename})
                        .then(newAuditorium_type => {
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify(newAuditorium_type.dataValues));
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        })
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/auditoriums' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium && jsonObj.auditorium_name && jsonObj.auditorium_capacity && jsonObj.auditorium_type){
                    await Auditorium.create({auditorium: jsonObj.auditorium, auditorium_name: jsonObj.auditorium_name, 
                        auditorium_capacity: jsonObj.auditorium_capacity, auditorium_type: jsonObj.auditorium_type})
                        .then(newAuditorium => {
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(JSON.stringify(newAuditorium.dataValues));
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        })
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err}));
            }
        })
    }
    else if(pathName == '/api/faculties' && req.method == 'PUT'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.faculty && jsonObj.faculty_name){
                    await Faculty.update({faculty_name: jsonObj.faculty_name}, {where: {faculty: jsonObj.faculty}})
                        .then(udpatesCount => {
                            if(udpatesCount == 0)
                                throw new Error("Element doesn't exist");
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        });
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

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.pulpit && jsonObj.pulpit_name && jsonObj.faculty){
                    await Pulpit.update({pulpit_name: jsonObj.pulpit_name, faculty: jsonObj.faculty}, {where: {pulpit: jsonObj.pulpit}})
                        .then(udpatesCount => {
                            if(udpatesCount == 0)
                                throw new Error("Element doesn't exist");
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        });
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/subjects' && req.method == 'PUT'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.subject && jsonObj.subject_name && jsonObj.pulpit){
                    await Subject.update({subject_name: jsonObj.subject_name, pulpit: jsonObj.pulpit}, {where: {subject: jsonObj.subject}})
                        .then(udpatesCount => {
                            if(udpatesCount == 0)
                                throw new Error("Element doesn't exist");
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        });
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/auditoriumtypes' && req.method == 'PUT'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium_type && jsonObj.auditorium_typename){
                    await Auditorium_type.update({auditorium_typename: jsonObj.auditorium_typename}, {where: {auditorium_type: jsonObj.auditorium_type}})
                        .then(udpatesCount => {
                            if(udpatesCount == 0)
                                throw new Error("Element doesn't exist");
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        });
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err.message}));
            }
        })
    }
    else if(pathName == '/api/auditoriums' && req.method == 'PUT'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', async () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium && jsonObj.auditorium_name && jsonObj.auditorium_capacity && jsonObj.auditorium_type){
                    await Auditorium.update({auditorium_name: jsonObj.auditorium_name, auditorium_capacity: jsonObj.auditorium_capacity, 
                        auditorium_type: jsonObj.auditorium_type}, {where: {auditorium: jsonObj.auditorium}})
                        .then(udpatesCount => {
                            if(udpatesCount == 0)
                                throw new Error("Element doesn't exist");
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        })
                        .catch(err => {
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        });
                }else throw new Error('Invalid Object Type');
            }catch (err) {
                resp.writeHead(400, { 'Content-Type': 'application/json' });
                resp.end(JSON.stringify({error: '400', message: err}));
            }
        })
    }
    else if(pathName.startsWith('/api/faculties') && req.method == 'DELETE'){
        let regex = /^\/api\/faculties\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let faculty = matches[1];
            let deletedFaculty = await Faculty.findOne({where: {faculty: faculty}});
            await Faculty.destroy({where: {faculty: faculty}})
                .then(deletedCount => {
                    if(deletedFaculty == null)
                        throw new Error("Element doesn't exist");

                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(deletedFaculty.dataValues));
                })
                .catch(err => {
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                });
        }
    }
    else if(pathName.startsWith('/api/pulpits') && req.method == 'DELETE'){

        let regex = /^\/api\/pulpits\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let pulpit = matches[1];
            let deletedPulpit = await Pulpit.findOne({where: {pulpit: pulpit}});
            await Pulpit.destroy({where: {pulpit: pulpit}})
                .then(deletedCount => {
                    if(deletedPulpit == null)
                        throw new Error("Element doesn't exist");

                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(deletedPulpit.dataValues));
                })
                .catch(err => {
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                });
        }
    }
    else if(pathName.startsWith('/api/subjects') && req.method == 'DELETE'){

        let regex = /^\/api\/subjects\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let subject = matches[1];
            let deletedSubject = await Subject.findOne({where: {subject: subject}});
            await Subject.destroy({where: {subject: subject}})
                .then(deletedCount => {
                    if(deletedSubject == null)
                        throw new Error("Element doesn't exist");

                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(deletedSubject.dataValues));
                })
                .catch(err => {
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                });
        }
    }
    else if(pathName.startsWith('/api/auditoriumtypes') && req.method == 'DELETE'){

        let regex = /^\/api\/auditoriumtypes\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let auditorium_type = matches[1];
            let deletedAuditorium_type = await Auditorium_type.findOne({where: {auditorium_type: auditorium_type}});
            await Auditorium_type.destroy({where: {auditorium_type: auditorium_type}})
                .then(deletedCount => {
                    if(deletedAuditorium_type == null)
                        throw new Error("Element doesn't exist");

                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(deletedAuditorium_type.dataValues));
                })
                .catch(err => {
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                });
        }
    }
    else if(pathName.startsWith('/api/auditoriums') && req.method == 'DELETE'){

        let regex = /^\/api\/auditoriums\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let auditorium = matches[1];
            let deletedAuditorium = await Auditorium.findOne({where: {auditorium: auditorium}});
            await Auditorium.destroy({where: {auditorium: auditorium}})
                .then(deletedCount => {
                    if(deletedAuditorium == null)
                        throw new Error("Element doesn't exist");

                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(deletedAuditorium.dataValues));
                })
                .catch(err => {
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                });
        }
    }
    else{
        resp.writeHead(404, {'Content-Type': 'application/json'});
        resp.end(JSON.stringify({error: '404', message: 'URL not found'}));
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log("Server listening on localhost:3000");
});