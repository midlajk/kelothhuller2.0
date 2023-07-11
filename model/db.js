const mongoose = require("mongoose");

// Connect to the db

const url = 'mongodb://127.0.0.1:27017/test'



//Connect methode of mongoose
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

//Get the default connection
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
//Connect methode of mongoose

//include employee model

require('./accountsmodal');

require('./employeemodel');
