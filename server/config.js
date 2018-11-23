require('dotenv').config();
const express = require("express");
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('./db/db');
const MongoStore = require('connect-mongo')(session);
const app = express();
const PORT = process.env.PORT || 3000;
const RT = require('./router')(app);
const CN = require("./controllers/controller");
const MD = require("./middlewares/middleware");
let hbs = require("express-handlebars");

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('hbs', hbs({
   extname: 'hbs',
   defaultLayout: 'main',
   layoutDir: __dirname + '../views/layouts/'
}));
app.set('view engine', 'hbs');

// app.use('X-Powered-By');
app.use((req, res, next) => {
     res.removeHeader('X-Powered-By');
     next();
});

app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false,
     store: new MongoStore({ mongooseConnection: mongoose.connection }),
     cookies: {
          maxAge: 1000 * 60 * 60 * 24 * 29
     }
}));

module.exports = {
    RT,
    CN,
    MD,
    express,
    bodyParser,
    app,
    PORT
}
