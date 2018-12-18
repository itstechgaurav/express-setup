require("dotenv").config();
const express = require("express");
const app = express();
require('./globals')(app);
var flash = require('connect-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = RQ('/db/db');
const MongoStore = require('connect-mongo')(session);
const STORE = process.env.NODE_ENV === 'dev' ? new session.MemoryStore() : new MongoStore({ mongooseConnection: mongoose.connection });
const {PORT = 3000} = process.env;
let hbs = require("express-handlebars");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine('hbs', hbs({
   extname: 'hbs',
   defaultLayout: 'main',
   layoutDir: __dirname + '../views/layouts/'
}));
app.set('view engine', 'hbs');

app.set('trust proxy', 1);
app.use(session({
     secret: process.env.SESSION_SECRET,
     resave: false,
     saveUninitialized: false,
     store: STORE,
     cookie: {
          maxAge: 365 * 24 * 60 * 60 * 1000
     }
}));

app.use(flash());
app.use("/*", MD("methods"));
RT.get("/index.php", "auth/auth@init");
app.use(express.static('public'));

module.exports = {
    RT,
    CN,
    MD,
    express,
    bodyParser,
    app,
    PORT
}
