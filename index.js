const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const db = mongoose.connection;
const app = express();
const cors = require('cors');

// //requiring local modeles
const dbConfig = require('your db config of mongodb');
const portConfig = require('port and environment');
const routes = require('your routes');



// Uncomment the following lines to start logging requests to consoles.
// app.use(morgan('combined'));
// parse application/x-www-form-urlencoded.
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

db.on('connected', function () {
  console.log('Mongoose default connection open to ' + dbConfig.url);
});

// If the connection throws an error
db.on('error',function (err) {
  console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
db.on('disconnected', function () {
  console.log('Mongoose default connection disconnected');
});

let gracefulExit = function() {
  db.close(function () {
    console.log('Mongoose default connection with DB :' +  dbConfig.url + ' is disconnected through app termination');
    process.exit(0);
  });
}

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', gracefulExit).on('SIGTERM', gracefulExit);

try {

  mongoose.connect( dbConfig.url,{ useNewUrlParser: true } );

  console.log("Trying to connect to DB " +  dbConfig.url);

} catch (err) {

  console.log("Sever initialization failed ", err.message)
};





//Initilizing routes.
routes(app);


//Finally starting the listener
app.listen(portConfig.port, function () {
  console.log('App now running on port '+portConfig.port+'!');
});