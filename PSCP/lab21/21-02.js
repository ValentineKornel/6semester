const express = require('express');
const passport = require('passport');
const DigestStrategy = require('passport-http').DigestStrategy;
const session = require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: '12345'
});
const { getCredential, verPassword } = require('./authData');

const app = express();

passport.use(new DigestStrategy({ qop: 'auth' },
    (username, done) => {
        const cr = getCredential(username);
        if (!cr) return done(null, false);
        return done(null, cr, cr.password);
    },
    (params, done) => {
        return done(null, true);
    }
));

passport.serializeUser((user, done) => done(null, user.username));
passport.deserializeUser((username, done) => {
    const cr = getCredential(username);
    if (!cr) return done(null, false);
    done(null, cr);
});

app.use(session);
app.use(passport.initialize());
app.use(passport.session());


const loginMiddleware = passport.authenticate('digest', { session: true });


app.get('/login', loginMiddleware, (req, res) => {
    res.redirect('/resource');
});

app.get('/resource', (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/login');
    res.send(`<h2>RESOURCE</h2><p>Hello, ${req.user.username}!</p><a href="/logout">Logout</a>`);
});

app.get('/logout', (req, res) => {
    req.logout(() => {
        req.session.destroy(() => {
            res.status(401).send(`<p>You have been logged out.</p>`);
        });
    });
});

app.use((req, res) => res.status(404).send('404 Not Found'));

app.listen(4000, () => console.log('Server started on http://localhost:4000'));
