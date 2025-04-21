const http = require('http');
const path = require('path');
const url = require('url');
const sql = require('mssql');
const fs = require('fs');

let config = {user:'ValentineNode', password:'12345', server:'localhost', database:'NodeLabsDB',
    pool: {max: 10, min: 0, idleTimeoutMillis: 10000},
    options: {encrypt: false}
};

const pool = new sql.ConnectionPool(config, err => {

    if(err) 
        console.log('Error connecting to DB: ', err.code, err.message);
    else
        console.log('Connected to DB successfuly');
});

let server = http.createServer(function(req, resp){
    const parsedURL = url.parse(req.url, true);
    const pathName =  parsedURL.pathname;
    console.log("Received request:", pathName, req.method);

    if(pathName == '/' && req.method == 'GET'){
        resp.writeHead(200, { 'Content-Type': 'text/html' });
        resp.end(fs.readFileSync('./14-02.html'));
    }
    else if(pathName == '/api/faculties' && req.method == 'GET'){
        executeSelectQuery('select faculty, faculty_name from faculty', resp);
    }
    else if(pathName == '/api/pulpits' && req.method == 'GET'){
        executeSelectQuery('select pulpit, pulpit_name, faculty from pulpit', resp);
    }
    else if(pathName == '/api/subjects' && req.method == 'GET'){
        executeSelectQuery('select subject, subject_name, pulpit from subject', resp);
    }
    else if(pathName == '/api/auditoriumtypes' && req.method == 'GET'){
        executeSelectQuery('select auditorium_type, auditorium_typename from auditorium_type', resp);
    }
    else if(pathName == '/api/auditoriums' && req.method == 'GET'){
        executeSelectQuery('select auditorium, auditorium_name, auditorium_capacity, auditorium_type from auditorium', resp);
    }
    else if(pathName == '/api/faculties' && req.method == 'POST'){
        let data = '';

        req.on('data', chunk => {
            data += chunk.toString();
        })

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.faculty && jsonObj.faculty_name){
                    insertFaculty(jsonObj.faculty, jsonObj.faculty_name, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
                    });
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.pulpit && jsonObj.pulpit_name && jsonObj.faculty){
                    insertPulpit(jsonObj.pulpit, jsonObj.pulpit_name, jsonObj.faculty, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
                    });
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.subject && jsonObj.subject_name && jsonObj.pulpit){
                    insertSubject(jsonObj.subject, jsonObj.subject_name, jsonObj.pulpit, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
                    });
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium_type && jsonObj.auditorium_typename){
                    insertAuditoriumType(jsonObj.auditorium_type, jsonObj.auditorium_typename, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
                    });
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium && jsonObj.auditorium_name && jsonObj.auditorium_capacity && jsonObj.auditorium_type){
                    insertAuditorium(jsonObj.auditorium, jsonObj.auditorium_name, jsonObj.auditorium_capacity, jsonObj.auditorium_type, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
                    });
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.faculty && jsonObj.faculty_name){
                    updateFaculty(jsonObj.faculty, jsonObj.faculty_name, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.pulpit && jsonObj.pulpit_name && jsonObj.faculty){
                    updatePulpit(jsonObj.pulpit, jsonObj.pulpit_name, jsonObj.faculty, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.subject && jsonObj.subject_name && jsonObj.pulpit){
                    updateSubject(jsonObj.subject, jsonObj.subject_name, jsonObj.pulpit, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err.message}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium_type && jsonObj.auditorium_typename){
                    updateAuditoriumType(jsonObj.auditorium_type, jsonObj.auditorium_typename, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
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

        req.on('end', () => {
            try{
                let jsonObj = JSON.parse(data);
                if(jsonObj.auditorium && jsonObj.auditorium_name && jsonObj.auditorium_capacity && jsonObj.auditorium_type){
                    updateAuditorium(jsonObj.auditorium, jsonObj.auditorium_name, jsonObj.auditorium_capacity, jsonObj.auditorium_type, (err, result) => {
                        if(err){
                            resp.writeHead(500, { 'Content-Type': 'application/json' });
                            resp.end(JSON.stringify({error: '500', message: err}));
                        }else{
                            resp.writeHead(200, {'Content-Type': 'application/json'});
                            resp.end(data);
                        }
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
            deleteFaculty(faculty, (err, result) => {
                if(err){
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                }else{
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(result));
                }
            });
        }
    }
    else if(pathName.startsWith('/api/pulpits') && req.method == 'DELETE'){

        let regex = /^\/api\/pulpits\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let pulpit = matches[1];
            deletePulpit(pulpit, (err, result) => {
                if(err){
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                }else{
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(result));
                }
            });
        }
    }
    else if(pathName.startsWith('/api/subjects') && req.method == 'DELETE'){

        let regex = /^\/api\/subjects\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let subject = matches[1];
            deleteSubject(subject, (err, result) => {
                if(err){
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                }else{
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(result));
                }
            });
        }
    }
    else if(pathName.startsWith('/api/auditoriumtypes') && req.method == 'DELETE'){

        let regex = /^\/api\/auditoriumtypes\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let auditoriumType = matches[1];
            deleteAuditoriumType(auditoriumType, (err, result) => {
                if(err){
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                }else{
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(result));
                }
            });
        }
    }
    else if(pathName.startsWith('/api/auditoriums') && req.method == 'DELETE'){

        let regex = /^\/api\/auditoriums\/([^\/]+)$/;
        let matches = pathName.match(regex);

        if(matches){
            let auditorium = matches[1];
            deleteAuditorium(auditorium, (err, result) => {
                if(err){
                    resp.writeHead(500, { 'Content-Type': 'application/json' });
                    resp.end(JSON.stringify({error: '500', message: err.message}));
                }else{
                    resp.writeHead(200, {'Content-Type': 'application/json'});
                    resp.end(JSON.stringify(result));
                }
            });
        }
    }
    else{
        resp.writeHead(404, {'Content-Type': 'application/json'});
        resp.end(JSON.stringify({error: '404', message: 'URL not found'}));
    }
});

let executeSelectQuery = (query, resp) => {
    pool.request().query(query, (err, result) => {
        if(err){
            resp.writeHead(404, {'Content-Type': 'applicatoin/json'});
            resp.end(JSON.stringify({error: '500', message: err.message}));
        }else{
            resp.writeHead(200, {'Content-Type': 'application/json'});
            resp.end(JSON.stringify(result.recordset));
        }
    });
}

let insertFaculty = (faculty, faculty_name, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('faculty', sql.VarChar(50)); 
    ps.input('faculty_name', sql.VarChar(100));
    ps.prepare('insert FACULTY(faculty, faculty_name) values (@faculty, @faculty_name)', err => {
        if(err) cb(err, null);
        else ps.execute({faculty:faculty, faculty_name:faculty_name}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let insertPulpit = (pulpit, pulpit_name, faculty, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('pulpit', sql.VarChar(50)); 
    ps.input('pulpit_name', sql.VarChar(100));
    ps.input('faculty', sql.VarChar(50));
    ps.prepare('insert PULPIT(pulpit, pulpit_name, faculty) values (@pulpit, @pulpit_name, @faculty)', err => {
        if(err) cb(err, null);
        else ps.execute({pulpit:pulpit, pulpit_name:pulpit_name, faculty:faculty}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let insertSubject = (subject, subject_name, pulpit, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('subject', sql.VarChar(50)); 
    ps.input('subject_name', sql.VarChar(100));
    ps.input('pulpit', sql.VarChar(50));
    ps.prepare('insert SUBJECT(subject, subject_name, pulpit) values (@subject, @subject_name, @pulpit)', err => {
        if(err) cb(err, null);
        else ps.execute({subject:subject, subject_name:subject_name, pulpit:pulpit}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let insertAuditoriumType = (auditorium_type, auditorium_typename, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('auditorium_type', sql.VarChar(50)); 
    ps.input('auditorium_typename', sql.VarChar(100));
    ps.prepare('insert AUDITORIUM_TYPE(auditorium_type, auditorium_typename) values (@auditorium_type, @auditorium_typename)', err => {
        if(err) cb(err, null);
        else ps.execute({auditorium_type:auditorium_type, auditorium_typename:auditorium_typename}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let insertAuditorium = (auditorium, auditorium_name, auditorium_capacity, auditorium_type, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('auditorium', sql.VarChar(50)); 
    ps.input('auditorium_name', sql.VarChar(100));
    ps.input('auditorium_capacity', sql.Int);
    ps.input('auditorium_type', sql.VarChar(50));

    ps.prepare('insert AUDITORIUM(auditorium, auditorium_name, auditorium_capacity, auditorium_type)'
        + 'values (@auditorium, @auditorium_name, @auditorium_capacity, @auditorium_type)', err => {
        if(err) cb(err, null);
        else ps.execute({auditorium:auditorium, auditorium_name:auditorium_name, 
            auditorium_capacity:auditorium_capacity, auditorium_type:auditorium_type}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let updateFaculty = (faculty_name, faculty, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('faculty', sql.VarChar(50)); 
    ps.input('faculty_name', sql.VarChar(100));
    ps.prepare('update FACULTY set faculty_name = @faculty_name where faculty = @faculty', err => {
        if(err) cb(err, null);
        else ps.execute({faculty:faculty, faculty_name:faculty_name}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let updatePulpit = (pulpit, pulpit_name, faculty, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('pulpit', sql.VarChar(50)); 
    ps.input('pulpit_name', sql.VarChar(100));
    ps.input('faculty', sql.VarChar(50)); 
    ps.prepare('update PULPIT set pulpit_name = @pulpit_name, faculty = @faculty where pulpit = @pulpit', err => {
        if(err) cb(err, null);
        else ps.execute({pulpit:pulpit, pulpit_name:pulpit_name, faculty:faculty}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let updateSubject = (subject, subject_name, pulpit, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('subject', sql.VarChar(50)); 
    ps.input('subject_name', sql.VarChar(100));
    ps.input('pulpit', sql.VarChar(50));
    ps.prepare('update SUBJECT set subject_name = @subject_name, pulpit = @pulpit where subject = @subject', err => {
        if(err) cb(err, null);
        else ps.execute({subject:subject, subject_name:subject_name, pulpit:pulpit}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let updateAuditoriumType = (auditorium_type, auditorium_typename, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('auditorium_type', sql.VarChar(50)); 
    ps.input('auditorium_typename', sql.VarChar(100));
    ps.prepare('update AUDITORIUM_TYPE set auditorium_typename = @auditorium_typename where auditorium_type = @auditorium_type', err => {
        if(err) cb(err, null);
        else ps.execute({auditorium_type:auditorium_type, auditorium_typename:auditorium_typename}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let updateAuditorium = (auditorium, auditorium_name, auditorium_capacity, auditorium_type, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let ps = new sql.PreparedStatement(pool);

    ps.input('auditorium', sql.VarChar(50)); 
    ps.input('auditorium_name', sql.VarChar(100));
    ps.input('auditorium_capacity', sql.Int);
    ps.input('auditorium_type', sql.VarChar(50));

    ps.prepare('update AUDITORIUM set auditorium_name = @auditorium_name, auditorium_capacity = @auditorium_capacity,'
        + ' auditorium_type = @auditorium_type where auditorium = @auditorium', err => {
        if(err) cb(err, null);
        else ps.execute({auditorium:auditorium, auditorium_name:auditorium_name, 
            auditorium_capacity:auditorium_capacity, auditorium_type:auditorium_type}, (err, result) => {
            if(err) cb(err, null);
            else cb(null, result);
        });
    });
};

let deleteFaculty = (faculty, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let deletedRow;

    pool.request()
    .input('faculty', sql.VarChar(50), faculty)
    .query('select faculty, faculty_name from faculty where faculty = @faculty', (err, result) => {
        if (err) cb(err, null);
        else
            deletedRow = result.recordset;
    });

    //if(deletedRow == null) cb(new Error('element not found'), null);

    let ps = new sql.PreparedStatement(pool);

    ps.input('faculty', sql.VarChar(50)); 
    ps.prepare('delete FACULTY where faculty = @faculty', err => {
        if(err) cb(err, null);
        else ps.execute({faculty:faculty}, (err, result) => {
            if(err) cb(err, null);
            else {
                if(deletedRow === undefined){
                    cb(new Error('element not found'), null);
                }
                cb(null, deletedRow);
            }
        });
    });
};

let deletePulpit = (pulpit, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let deletedRow;

    pool.request()
    .input('pulpit', sql.VarChar(50), pulpit)
    .query('select pulpit, pulpit_name, faculty from pulpit where pulpit = @pulpit', (err, result) => {
        if (err) cb(err, null);
        else
            deletedRow = result.recordset;
    });
    //if(deletedRow == null) cb(new Error('element not found'), null);

    let ps = new sql.PreparedStatement(pool);

    ps.input('pulpit', sql.VarChar(50)); 
    ps.prepare('delete PULPIT where pulpit = @pulpit', err => {
        if(err) cb(err, null);
        else ps.execute({pulpit:pulpit}, (err, result) => {
            if(err) cb(err, null);
            else {
                if(deletedRow === undefined){
                    cb(new Error('element not found'), null);
                }
                cb(null, deletedRow);
            }
        });
    });
};

let deleteSubject = (subject, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let deletedRow;

    pool.request()
    .input('subject', sql.VarChar(50), subject)
    .query('select subject, subject_name, pulpit from subject where subject = @subject', (err, result) => {
        if (err) cb(err, null);
        else
            deletedRow = result.recordset;
    });
    //if(deletedRow == null) cb(new Error('element not found'), null);


    let ps = new sql.PreparedStatement(pool);

    ps.input('subject', sql.VarChar(50)); 
    ps.prepare('delete SUBJECT where subject = @subject', err => {
        if(err) cb(err, null);
        else ps.execute({subject:subject}, (err, result) => {
            if(err) cb(err, null);
            else {
                if(deletedRow === undefined){
                    cb(new Error('element not found'), null);
                }
                cb(null, deletedRow);
            }
        });
    });
};

let deleteAuditoriumType = (auditorium_type, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let deletedRow;

    pool.request()
    .input('auditorium_type', sql.VarChar(50), auditorium_type)
    .query('select auditorium_type, auditorium_typename from auditorium_type where auditorium_type = @auditorium_type', (err, result) => {
        if (err) cb(err, null);
        else
            deletedRow = result.recordset;
    });
    //if(deletedRow == null) cb(new Error('element not found'), null);


    let ps = new sql.PreparedStatement(pool);

    ps.input('auditorium_type', sql.VarChar(50)); 
    ps.prepare('delete AUDITORIUM_TYPE where auditorium_type = @auditorium_type', err => {
        if(err) cb(err, null);
        else ps.execute({auditorium_type:auditorium_type}, (err, result) => {
            if(err) cb(err, null);
            else {
                if(deletedRow === undefined){
                    cb(new Error('element not found'), null);
                }
                cb(null, deletedRow);
            }
        });
    });
};

let deleteAuditorium = async (auditorium, _cb) => {
    let cb = _cb ? _cb : (err, result) => {console.log('default db')};
    let deletedRow;

    pool.request()
    .input('auditorium', sql.VarChar(50), auditorium)
    .query('select auditorium, auditorium_name, auditorium_capacity, auditorium_type from auditorium where auditorium = @auditorium', async (err, result) => {
        if (err) cb(err, null);
        else{
            deletedRow = result.recordset
        }
    });
    

    let ps = new sql.PreparedStatement(pool);

    ps.input('auditorium', sql.VarChar(50)); 
    ps.prepare('delete AUDITORIUM where auditorium = @auditorium', err => {
        if(err) cb(err, null);
        else ps.execute({auditorium:auditorium}, (err, result) => {
            if(err) cb(err, null);
            else {
            console.log(deletedRow);
            if(deletedRow === undefined){
                cb(new Error('element not found'), null);
            }
            cb(null, deletedRow);
            }
        });
    });
};

server.listen(3000, '127.0.0.1', () => {
    console.log("Server listening on localhost:3000");
})