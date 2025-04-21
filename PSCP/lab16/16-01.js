const http = require('http');
const { graphql, buildSchema } = require('graphql');
const sql = require('mssql');

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

const schema = buildSchema(`
  type Faculty {
    faculty: String
    facultyName: String
    pulpits: [Pulpit]
  }

  type Pulpit{
    pulpit: String
    pulpitName: String
    faculty: String
    teachers: [Teacher]
    subjects: [Subject]
  }

  type Teacher{
    teacher: String
    teacherName: String
    pulpit: String
  }

  type Subject{
    subject: String
    subjectName: String
    pulpit: String
  }

  type Query {
    getFaculties(faculty: String): [Faculty]
    getPulpits(pulpit: String): [Pulpit]
    getTeachers(teacher: String): [Teacher]
    getSubjects(subject: String): [Subject]
    getTeachersByFaculty(faculty: String!): [Teacher]
    getSubjectsByFaculties(faculty: String): [Pulpit]
  }

  type Mutation {
    setFaculty(faculty: String!, facultyName: String!): Faculty
    setPulpit(pulpit: String!, pulpitName: String!, faculty: String): Pulpit
    setTeacher(teacher: String!, teacherName: String!, pulpit: String): Teacher
    setSubject(subject: String!, subjectName: String!, pulpit: String): Subject
    delFaculty(faculty: String!): Boolean
    delPulpit(pulpit: String!): Boolean
    delTeacher(teacher: String!): Boolean
    delSubject(subject: String!): Boolean

  }
`);

const rootValue = {
    getFaculties: async ({faculty}) => {
        try {
            let query = 'SELECT FACULTY, FACULTY_NAME FROM FACULTY';
            if(faculty){ query += ` where FACULTY = @faculty`; }

            const request = await pool.request();
            if (faculty) request.input('faculty', sql.VarChar(50), faculty);
            const result = await request.query(query);

            const faculties = result.recordset.map(row => ({
                faculty: row.FACULTY,
                facultyName: row.FACULTY_NAME,
                pulpits: async () => {
                    const pulpitsQuery = 'SELECT PULPIT, PULPIT_NAME, FACULTY FROM PULPIT WHERE FACULTY = @faculty';
                    const pulpitsRequest = pool.request();
                    pulpitsRequest.input('faculty', sql.VarChar(50), row.FACULTY);
                    const pulpitsResult = await pulpitsRequest.query(pulpitsQuery);
                    return pulpitsResult.recordset.map(pulpit => ({
                        pulpit: pulpit.PULPIT,
                        pulpitName: pulpit.PULPIT_NAME,
                        faculty: pulpit.FACULTY,
                        teachers: async () => {
                            const teachersQuery = 'SELECT TEACHER, TEACHER_NAME, PULPIT FROM TEACHER WHERE PULPIT = @pulpit';
                            const teachersRequest = pool.request();
                            teachersRequest.input('pulpit', sql.VarChar(50), pulpit.PULPIT);
                            const teachersResult = await teachersRequest.query(teachersQuery);
                            return teachersResult.recordset.map(teacher => ({
                                teacher: teacher.TEACHER,
                                teacherName: teacher.TEACHER_NAME,
                                pulpit: teacher.PULPIT
                            }));
                        },
                        subjects: async () => {
                            const sujectsQuery = 'SELECT SUBJECT, SUBJECT_NAME, PULPIT FROM SUBJECT WHERE PULPIT = @pulpit';
                            const subjectsRequest = pool.request();
                            subjectsRequest.input('pulpit', sql.VarChar(50), pulpit.PULPIT);
                            const subjectsResult = await subjectsRequest.query(sujectsQuery);
                            return subjectsResult.recordset.map(subject => ({
                                subject: subject.SUBJECT,
                                subjectName: subject.SUBJECT_NAME,
                                pulpit: subject.PULPIT
                            }));
                        }
                    }));
                }
            }));

            return faculties;
            } catch (err) {
            console.error('Error while fetching data from DB', err);
            throw new Error('Failed to fetch data');
        }
    },
    getPulpits: async ({pulpit}) => {
        try{
            let query = 'SELECT PULPIT, PULPIT_NAME, FACULTY FROM PULPIT';
            if(pulpit){ query += ` where PULPIT = @pulpit`; }

            const request = await pool.request();
            if (pulpit) request.input('pulpit', sql.VarChar(50), pulpit);
            const result = await request.query(query);

            const pulpits = result.recordset.map(row => ({
                pulpit: row.PULPIT,
                pulpitName: row.PULPIT_NAME,
                faculty: row.FACULTY,
                teachers: async () => {
                    const teachersQuery = 'SELECT TEACHER, TEACHER_NAME, PULPIT FROM TEACHER WHERE PULPIT = @pulpit';
                    const teachersRequest = pool.request();
                    teachersRequest.input('pulpit', sql.VarChar(50), row.PULPIT);
                    const teachersResult = await teachersRequest.query(teachersQuery);
                    return teachersResult.recordset.map(teacher => ({
                        teacher: teacher.TEACHER,
                        teacherName: teacher.TEACHER_NAME,
                        pulpit: teacher.PULPIT
                    }));
                },
                subjects: async () => {
                    const sujectsQuery = 'SELECT SUBJECT, SUBJECT_NAME, PULPIT FROM SUBJECT WHERE PULPIT = @pulpit';
                    const subjectsRequest = pool.request();
                    subjectsRequest.input('pulpit', sql.VarChar(50), row.PULPIT);
                    const subjectsResult = await subjectsRequest.query(sujectsQuery);
                    return subjectsResult.recordset.map(subject => ({
                        subject: subject.SUBJECT,
                        subjectName: subject.SUBJECT_NAME,
                        pulpit: subject.PULPIT
                    }));
                }
            }));

            return pulpits;
        } catch (err) {
            console.error('Error while fetching data from DB', err);
            throw new Error('Failed to fetch data');
        }
    },
    getTeachers: async ({teacher}) => {
        try{
            let query = 'SELECT TEACHER, TEACHER_NAME, PULPIT FROM TEACHER';
            if(teacher){ query += ` where TEACHER = @teacher`; }

            const request = await pool.request();
            if (teacher) request.input('teacher', sql.VarChar(50), teacher);
            const result = await request.query(query);

            return result.recordset.map(row => ({
                teacher: row.TEACHER,
                teacherName: row.TEACHER_NAME,
                pulpit: row.PULPIT
            }));
        } catch (err) {
            console.error('Error while fetching data from DB', err);
            throw new Error('Failed to fetch data');
        }
    },
    getSubjects: async ({subject}) => {
        try{
            let query = 'SELECT SUBJECT, SUBJECT_NAME, PULPIT FROM SUBJECT';
            if(subject){ query += ` where SUBJECT = @subject`; }

            const request = await pool.request();
            if (subject) request.input('subject', sql.VarChar(50), subject);
            const result = await request.query(query);

            return result.recordset.map(row => ({
                subject: row.SUBJECT,
                subjectName: row.SUBJECT_NAME,
                pulpit: row.PULPIT
            }));
        } catch (err) {
            console.error('Error while fetching data from DB', err);
            throw new Error('Failed to fetch data');
        }
    },
    setFaculty: async({faculty, facultyName}) => {
        try {
            const checkQuery = 'SELECT * FROM FACULTY WHERE FACULTY = @faculty';
            const request = pool.request();
            request.input('faculty', sql.VarChar(50), faculty);
            const checkResult = await request.query(checkQuery);

            if (checkResult.recordset.length > 0) {
                const updateQuery = 'UPDATE FACULTY SET FACULTY_NAME = @facultyName WHERE FACULTY = @faculty';
                request.input('facultyName', sql.VarChar(100), facultyName);
                await request.query(updateQuery);
            } else {
                const insertQuery = 'INSERT INTO FACULTY (FACULTY, FACULTY_NAME) VALUES (@faculty, @facultyName)';
                request.input('facultyName', sql.VarChar(100), facultyName);
                await request.query(insertQuery);
            }

            return { faculty, facultyName };
        } catch (err) {
            console.error('Error while setting faculty', err);
            throw new Error('Failed to set faculty');
        }
    },
    setPulpit: async({pulpit, pulpitName, faculty}) => {
        try {
            const checkQuery = 'SELECT * FROM PULPIT WHERE PULPIT = @pulpit';
            const request = pool.request();
            request.input('pulpit', sql.VarChar(50), pulpit);
            request.input('pulpitName', sql.VarChar(100), pulpitName);
            request.input('faculty', sql.VarChar(50), faculty);
            const checkResult = await request.query(checkQuery);

            if (checkResult.recordset.length > 0) {
                const updateQuery = 'UPDATE PULPIT SET PULPIT_NAME = @pulpitName, FACULTY = @faculty WHERE PULPIT = @pulpit';
                await request.query(updateQuery);
            } else {
                const insertQuery = 'INSERT INTO PULPIT (PULPIT, PULPIT_NAME, FACULTY) VALUES (@pulpit, @pulpitName, @faculty)';
                await request.query(insertQuery);
            }

            return { pulpit, pulpitName, faculty };
        } catch (err) {
            console.error('Error while setting faculty', err);
            throw new Error('Failed to set faculty');
        }
    },
    setTeacher: async({teacher, teacherName, pulpit}) => {
        try {
            const checkQuery = 'SELECT * FROM TEACHER WHERE TEACHER = @teacher';
            const request = pool.request();
            request.input('teacher', sql.VarChar(50), teacher);
            request.input('teacherName', sql.VarChar(100), teacherName);
            request.input('pulpit', sql.VarChar(50), pulpit);
            const checkResult = await request.query(checkQuery);

            if (checkResult.recordset.length > 0) {
                const updateQuery = 'UPDATE TEACHER SET TEACHER_NAME = @teacherName, PULPIT = @pulpit WHERE TEACHER = @teacher';
                await request.query(updateQuery);
            } else {
                const insertQuery = 'INSERT INTO TEACHER (TEACHER, TEACHER_NAME, PULPIT) VALUES (@teacher, @teacherName, @pulpit)';
                await request.query(insertQuery);
            }

            return { teacher, teacherName, pulpit };
        } catch (err) {
            console.error('Error while setting faculty', err);
            throw new Error('Failed to set faculty');
        }
    },
    setSubject: async({subject, subjectName, pulpit}) => {
        try {
            const checkQuery = 'SELECT * FROM SUBJECT WHERE SUBJECT = @subject';
            const request = pool.request();
            request.input('subject', sql.VarChar(50), subject);
            request.input('subjectName', sql.VarChar(100), subjectName);
            request.input('pulpit', sql.VarChar(50), pulpit);
            const checkResult = await request.query(checkQuery);

            if (checkResult.recordset.length > 0) {
                const updateQuery = 'UPDATE SUBJECT SET SUBJECT_NAME = @subjectName, PULPIT = @pulpit WHERE SUBJECT = @subject';
                await request.query(updateQuery);
            } else {
                const insertQuery = 'INSERT INTO SUBJECT (SUBJECT, SUBJECT_NAME, PULPIT) VALUES (@subject, @subjectName, @pulpit)';
                await request.query(insertQuery);
            }

            return { subject, subjectName, pulpit };
        } catch (err) {
            console.error('Error while setting faculty', err);
            throw new Error('Failed to set faculty');
        }
    },
    delFaculty: async ({ faculty }) => {
        try {
            const checkQuery = 'SELECT COUNT(*) as count FROM FACULTY WHERE FACULTY = @faculty';
            const deleteQuery = 'DELETE FROM FACULTY WHERE FACULTY = @faculty';
    
            const request = pool.request();
            request.input('faculty', sql.VarChar(50), faculty);
    
            const checkResult = await request.query(checkQuery);
            if (checkResult.recordset[0].count === 0) {
                return false;
            }
    
            await request.query(deleteQuery);
            return true;
        } catch (err) {
            console.error('Error deleting faculty:', err);
            throw new Error('Failed to delete faculty');
        }
    },
    delPulpit: async ({ pulpit }) => {
        try {
            const checkQuery = 'SELECT COUNT(*) as count FROM PULPIT WHERE PULPIT = @pulpit';
            const deleteQuery = 'DELETE FROM PULPIT WHERE PULPIT = @pulpit';
    
            const request = pool.request();
            request.input('pulpit', sql.VarChar(50), pulpit);
    
            const checkResult = await request.query(checkQuery);
            if (checkResult.recordset[0].count === 0) {
                return false;
            }
    
            await request.query(deleteQuery);
            return true;
        } catch (err) {
            console.error('Error deleting faculty:', err);
            throw new Error('Failed to delete faculty');
        }
    },
    delTeacher: async ({ teacher }) => {
        try {
            const checkQuery = 'SELECT COUNT(*) as count FROM TEACHER WHERE TEACHER = @teacher';
            const deleteQuery = 'DELETE FROM TEACHER WHERE TEACHER = @teacher';
    
            const request = pool.request();
            request.input('teacher', sql.VarChar(50), teacher);
    
            const checkResult = await request.query(checkQuery);
            if (checkResult.recordset[0].count === 0) {
                return false;
            }
    
            await request.query(deleteQuery);
            return true;
        } catch (err) {
            console.error('Error deleting faculty:', err);
            throw new Error('Failed to delete faculty');
        }
    },
    delSubject: async ({ subject }) => {
        try {
            const checkQuery = 'SELECT COUNT(*) as count FROM SUBJECT WHERE SUBJECT = @subject';
            const deleteQuery = 'DELETE FROM SUBJECT WHERE SUBJECT = @subject';
    
            const request = pool.request();
            request.input('subject', sql.VarChar(50), subject);
    
            const checkResult = await request.query(checkQuery);
            if (checkResult.recordset[0].count === 0) {
                return false;
            }
    
            await request.query(deleteQuery);
            return true;
        } catch (err) {
            console.error('Error deleting faculty:', err);
            throw new Error('Failed to delete faculty');
        }
    },
    getTeachersByFaculty: async ({faculty}) => {
        try {
            let query = 'SELECT TEACHER, TEACHER_NAME, t.PULPIT FROM TEACHER t INNER JOIN PULPIT p on t.pulpit = p.pulpit INNER JOIN FACULTY f on p.faculty = f.faculty';
            if(faculty){ query += ` where f.FACULTY = @faculty`; }

            const request = await pool.request();
            if (faculty) request.input('faculty', sql.VarChar(50), faculty);
            const result = await request.query(query);

            const teachers = result.recordset.map(row => ({
                teacher: row.TEACHER,
                teacherName: row.TEACHER_NAME,
                pulpit: row.PULPIT
            }));


            return teachers;
            } catch (err) {
            console.error('Error while fetching data from DB', err);
            throw new Error('Failed to fetch data');
        }
    },
    getSubjectsByFaculties: async ({faculty}) => {
        try {
            let query = 'SELECT PULPIT, PULPIT_NAME, FACULTY FROM PULPIT';
            if(faculty){ query += ` where FACULTY = @faculty`; }

            const request = await pool.request();
            if (faculty) request.input('faculty', sql.VarChar(50), faculty);
            const result = await request.query(query);

            const pulpits = result.recordset.map(row => ({
                pulpit: row.PULPIT,
                pulpitName: row.PULPIT_NAME,
                faculty: row.FACULTY,
                subjects: async () => {
                    const sujectsQuery = 'SELECT SUBJECT, SUBJECT_NAME, PULPIT FROM SUBJECT WHERE PULPIT = @pulpit';
                    const subjectsRequest = pool.request();
                    subjectsRequest.input('pulpit', sql.VarChar(50), row.PULPIT);
                    const subjectsResult = await subjectsRequest.query(sujectsQuery);
                    return subjectsResult.recordset.map(subject => ({
                        subject: subject.SUBJECT,
                        subjectName: subject.SUBJECT_NAME,
                        pulpit: subject.PULPIT
                    }));
                }
            }));

            return pulpits;
            } catch (err) {
            console.error('Error while fetching data from DB', err);
            throw new Error('Failed to fetch data');
        }
    }
};

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/graphql') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', async () => {
      try {
        const query = JSON.parse(body).query;
        const result = await graphql({schema, source: query, rootValue});
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, () => {
  console.log('Server is running on localhost:3000');
});





















// setTimeout(() => {
//     graphql({
//         schema,
//         source: '{ faculties { faculty facultyName } }',
//         rootValue,
//         }).then((response) => {
//           console.log(JSON.stringify(response, null, 2));
//         });
// }, 2000);