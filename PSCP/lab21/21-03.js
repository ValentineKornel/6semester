const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const { getCredential, verPassword } = require('./authData');

const app = express();

app.use(session({
    secret: '12345',
    resave: false,
    saveUninitialized: false
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const loginMiddleware = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    res.redirect('/login');
};

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = getCredential(username);

    if (user && verPassword(user.password, password)) {
        req.session.user = username;
        res.redirect('/resource');
    } else {
        res.send(`<p>Invalid credential. <a href="/login">Try again</a></p>`);
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.send(`<p>You have been logged out.</p>`);
    });
});

app.get('/resource', loginMiddleware, (req, res) => {
    res.send(`<h2>RESOURCE</h2><p>Hello, ${req.session.user}!</p><a href="/logout">Logout</a>`);
});

app.use((req, res) => res.status(404).send('404 Not Found'));

app.listen(5000, () => console.log('Server started on http://localhost:5000'));
