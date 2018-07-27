var User = require('../models/user');
var path = require('path');
//var redis = require("redis"),
//client = redis.createClient();
module.exports = function(router,io){
	
	io.on('connection', function(socket) {		
	   socket.on('disconnect', function () {
		  //console.log('A user disconnected');
	   });	
	
		// GET route for reading data
		router.get('/', function (req, res, next) {
			console.log(__dirname);
		  return res.sendFile(path.join(path.dirname(__dirname) + '/templateLogReg/index.html'));
		});


		//POST route for updating data
		router.post('/', function (req, res, next) {
			console.log('hari',req.body);
		  // confirm that user typed same password twice
		  if (req.body.password !== req.body.passwordConf) {
			var err = new Error('Passwords do not match.');
			err.status = 400;
			res.send("passwords dont match");
			return next(err);
		  }

		  if (req.body.email &&
			req.body.username &&
			req.body.password &&
			req.body.passwordConf) {

			var userData = {
			  email: req.body.email,
			  username: req.body.username,
			  password: req.body.password,
			  passwordConf: req.body.passwordConf,
			}

			User.create(userData, function (error, user) {
			  if (error) {			  
				  if(error.message.indexOf("duplicate key")>0){
					  if(error.message.indexOf("username")>0){
						  return res.send("username already registered with us");
					  }
					  if(error.message.indexOf("mail")>0){
						  return res.send("mail id already registered with us");
					  }
				  }else{
					  console.log('error',err.message);
					return res.send(error.message);
				  }
				//return next(error);			
			  } else {
				 console.log(user); 
				//client.set(user._id,user.email);
				req.session.userId = user._id;
				return res.redirect('/profile');
			  }
			});

		  } else if (req.body.logemail && req.body.logpassword) {
			User.authenticate(req.body.logemail, req.body.logpassword, function (error, user) {
			  if (error || !user) {
				var err = new Error('Wrong email or password.');
				err.status = 401;
				return next(err);
			  } else {
				req.session.userId = user._id;
				return res.redirect('/profile');
			  }
			});
		  } else {
			var err = new Error('All fields required.');
			err.status = 400;
			return next(err);
		  }
		})

		// GET route after registering
		router.get('/profile', function (req, res, next) {
			/*client.get(req.session.userId, function(error, reply) {
				if (error) {
					return next(error);
				} else {
				if (user === null) {
				  var err = new Error('Not authorized! Go back!');
				  err.status = 400;
				  return next(err);
				} else {
					io.emit('event',{name:reply});
				  return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
				}
			  }
			});*/
		  User.findById(req.session.userId)
			.exec(function (error, user) {
			  if (error) {
				return next(error);
			  } else {
				if (user === null) {
				  var err = new Error('Not authorized! Go back!');
				  err.status = 400;
				  return next(err);
				} else {
					io.sockets.emit('userLogged',{name:user.username,email:user.email});
				  return res.send('<h1>Name: </h1>' + user.username + '<h2>Mail: </h2>' + user.email + '<br><a type="button" href="/logout">Logout</a>')
				}
			  }
			});
		});

		// GET for logout logout
		router.get('/logout', function (req, res, next) {
		  if (req.session) {
			// delete session object
			req.session.destroy(function (err) {
			  if (err) {
				return next(err);
			  } else {
				return res.redirect('/');
			  }
			});
		  }
		});
	});
	//return router;
}
