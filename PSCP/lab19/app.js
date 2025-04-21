const express = require('express');
const path = require('path');
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));


const routes = require('./routes');
app.use(routes);

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
