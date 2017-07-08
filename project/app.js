/* Some initialization boilerplate. Also, we include the code from
   routes/routes.js, so we can have access to the routes. Note that
   we get back the object that is defined at the end of routes.js,
   and that we use the fields of that object (e.g., routes.get_main)
   to access the routes. */

var express = require('express');
var routes = require('./routes/routes.js');
var session = require('express-session');
var app = express();

app.use(express.bodyParser());
app.use(express.logger("default"));
app.use(express.static(__dirname + '/nets212'));

app.use(express.cookieParser());
app.use(express.session({secret: 'abcd'}));

var aws = require("./models/keyvaluestore.js");
var db = require('./models/database.js');

var users = new aws("users_nets");
var foodtrucks = new aws("foodtrucks_nets");

users.init(function() {
	foodtrucks.init(function() {

	});
});

/* Below we install the routes. The first argument is the URL that we
   are routing, and the second argument is the handler function that
   should be invoked when someone opens that URL. Note the difference
   between app.get and app.post; normal web requests are GETs, but
   POST is often used when submitting web forms ('method="post"'). */

app.get('/', routes.splash_page);
app.get('/login', routes.get_login);
app.post('/checklogin', routes.post_login_results);

app.get('/signup', routes.sign_up);
app.post('/createaccount', routes.post_create_account);

app.get('/gatherdata', routes.gather_data);

app.get('/foodtrucks', routes.foodtrucks);
app.post('/removefoodtruck', routes.remove_foodtruck);
app.post('/addfoodtruck', routes.add_foodtruck);
app.post('/logout', routes.logout);
app.post('/updatefoodtruck', routes.update_foodtruck);
app.post('/downvote', routes.downvote_foodtruck);

app.get('/foodtruckdata', function(req, res) {
	//Get all the data in the foodtrucks table
	db.getFoodTrucks(function(data, err) {
		if (err) {
			console.log("There was an error");
		} else {
			var obj = {
				user: req.session.user,
				data: data
			};
			res.send(JSON.stringify(obj));
		}
	});
});

/* Run the server */

console.log('Author: Benjamin Leitner (bleitner)');
app.listen(8080);
console.log('Server running on port 8080. Now open http://localhost:8080/ in your browser!');
