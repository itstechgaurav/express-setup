require("dotenv").config();
const express = require("express");
var flash = require('connect-flash');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('./../db/db');
const MongoStore = require('connect-mongo')(session);
const STORE = process.env.NODE_ENV === 'dev' ? new session.MemoryStore() : new MongoStore({ mongooseConnection: mongoose.connection });
const app = express();
const {PORT = 3000} = process.env;
const RT = require('./router')(app);
const CN = require("./../controllers/controller");
const MD = require("./../middlewares/middleware");
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

module.exports = {
    RT,
    CN,
    MD,
    express,
    bodyParser,
    app,
    PORT
}
