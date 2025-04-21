const express = require('express');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: '12345'
});
const { getCredential, verPassword } = require('./authData');

const app = express();


passport.use(new BasicStrategy((username, password, done) => {
    const cr = getCredential(username);
    if (!cr) return done(null, false, { message: 'Incorrect username' });
    if (!verPassword(cr.password, password)) return done(null, false, { message: 'Incorrect password' });
    return done(null, username);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(session);
app.use(passport.initialize());
app.use(passport.session());


const loginMiddleware = passport.authenticate('basic', { session: true });


app.get('/login', loginMiddleware, (req, res) => {
    res.redirect('/resource');
});

app.get('/resource', (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.send(`<h2>RESOURCE</h2><p>Hello, ${req.user}!</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.status(401).send(`
                <p>You have been logged out.</p>
            `);
        });
    });
});

app.use((req, res) => res.status(404).send('404 Not Found'));

app.listen(3000, () => console.log('Server started on http://localhost:3000'));
