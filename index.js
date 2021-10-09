require('./model/db');
const path = require('path');
const session = require('express-session');
const express = require('express');
const bodyParser = require('body-parser');
const moment = require("moment");
require('dotenv').config();
const MongoDBStore = require('connect-mongodb-session')(session);
// const csrf = require('csurf');
const flash = require('connect-flash');



const PORT = process.env.PORT || 500;
const app = express();
app.set('view engine', 'ejs');
app.set('views', 'views');


 //const url = 'mongodb://127.0.0.1:27017'
const url = "mongodb+srv://Fazil2000:Fazil2000@cluster0.6qacz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

const store = new MongoDBStore({
    uri: url,
    collection: 'sessions',
    

 });

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));



app.use(
    session({
        secret: 'my secret',
        resave: false,
        saveUninitialized: false,
        store: store,
    

    })
);

// app.use(flash());
// const csrfProtection = csrf();
// app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
 
    res.locals.moment = moment;
    res.locals.todaydate = moment(new Date()).format('YYYY-MM-DD');
    // res.locals.csrfToken = req.csrfToken();
    next();
});
const accounts = require('./routes/account');
const employeeroute = require('./routes/employee');
const managementroutes = require('./routes/management');
const mainroutes = require('./routes/main');
const borrows = require('./routes/borrows_salary');
app.use(managementroutes);
app.use(mainroutes);
app.use('/employee',employeeroute);
app.use(accounts);
app.use('/paymentcontroller',borrows);

app.listen(PORT)