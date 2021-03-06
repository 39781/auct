var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var http = require('http');
//connect to MongoDB
mongoose.connect('mongodb://user1:myname123@ds153851.mlab.com:53851/users',{ useMongoClient: true });
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('mongo connected');
});

//use sessions for tracking logins
app.use(session({
  secret: 'ichustammnai',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// serve static files from template
app.use(express.static(__dirname + '/templateLogReg'));

// include routes

/*

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});
*/
// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  //console.log('index value',err.message.indexOf("duplicate key"));
  res.send(err.message);
});
var server = http.createServer(app);

// listen on port 3000
server.listen(3000, function () {
	console.log('Express app listening on port 3000');
	var io = require('socket.io').listen(server);
	var routes = require('./routes/router')(app,io);
	//app.use('/', routes);
});
