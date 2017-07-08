var keyvaluestore = require('../models/keyvaluestore.js');
var async = require('async');
var users = new keyvaluestore('users_nets');
var foodtrucks = new keyvaluestore('foodtrucks_nets');
users.init(function(err, data){});
foodtrucks.init(function(err, data){});

/* The function below is an example of a database method. Whenever you need to 
   access your database, you should define a function (myDB_addUser, myDB_getPassword, ...)
   and call that function from your routes - don't just call DynamoDB directly!
   This makes it much easier to make changes to your database schema. */

var myDB_getPassword = function(username, route_callbck){
	console.log('Looking up password for ' + username);	
	
	//Get the information for a particular user
	users.get(username, function (err, data) {
		if (err) { //Error check
			route_callbck(null, "Lookup error: " + err);
		} else if (data === null) {
			route_callbck(null, null);
		} else {
			//Obtain the password to validate it
			var pw = JSON.parse(data[0].value);
			pw = pw.password;
			route_callbck({ password : pw }, null);
		}
	});
};

var myDB_addUser = function(username, password, fullname, route_callbck) {
	console.log('Adding ' + username + ' as a user.');
	
	//Store the user's info in an object
	var valObj = {
			password: password,
			fullname: fullname
	};
	
	//Put it in the user table
	users.put(username, JSON.stringify(valObj), function (err, data) {
		if (err) { //Error check
			console.log("Oops, error when adding "+ username + ": " + err);
			route_callbck(null, "Lookup error: " + err);
		} else { //Send a successful message
			route_callbck({message: "success"}, null);
		}
	});
};

var myDB_exists = function(username, route_callbck) {
	console.log('Checking to see if ' + username + ' is already taken.');
	
	//Get data on the user
	users.get(username, function (err, data) {
		if (err) { //Error check
			route_callbck(null, "Lookup error: " + err);
		} else if (data === null) {
			route_callbck(null, null);
		} else { //If there is already info, we know the user exists
			route_callbck({message : "user already exists"}, null);
		}
	});
};

var myDB_addFoodTruck = function(latitude, longitude, name, user, route_callbck) {
	console.log('Adding the food truck ' + name);
	
	//Build an object with the restaurant information
	var valObj = {
			name: name,
			latitude: latitude,
			longitude: longitude,
			// description: description,
			creator: user,
			review: "No reviews yet"
	};

	//Add the restaurant to the restaurants table
	foodtrucks.put(name, JSON.stringify(valObj), function (err, data) {
		if (err) { //Error check
			console.log("Oops, error when adding "+ name + ": " + err);
			route_callbck(null, "Lookup error: " + err);
		} else { //Send a successful message back
			route_callbck({message: "success"}, null);
		}
	});
};

var myDB_foodTruck_exists = function(foodtruck, route_callbck) {
	console.log('Checking to see if ' + foodtruck + ' has already been added.');
	
	foodtrucks.get(foodtrucks, function (err, data) {
		if (err) { //Error check
			console.log("ERROR");
			console.log(err);
			route_callbck(null, "Lookup error: " + err);
		} else if (data === null) {
			route_callbck(null, null);
		} else { //If there is already info, we know the restaurant exists
			route_callbck({message : "food truck has already been added"}, null);
		}
	});
};

var myDB_get_foodTrucks = function(route_callbck) {
	console.log('Scanning all food trucks');
	foodtrucks.scanKeys(function(err, data) {
		if (err) {
			route_callbck(null, "Error: " + err);
		} else if (data === null) {
			route_callbck(null, null);
		} else {
			var callbackData = [];
			async.each(data, function (item, callback) {
				foodtrucks.get(item.key, function (err, data) {
					if (err) {
						route_callbck(null, "Error: " + err);
					} else {
						callbackData[item.inx] = {
								key: item.key,
								vals: data[0].value
						};
						callback();
					}
				});
			},
			function (err) {
				route_callbck(callbackData, null);
			});
		}
	});
};

var myDB_remove_foodTruck = function(foodtruck, route_callbck) {
	foodtrucks.get(foodtruck, function(err, data) {
		if (err) {
			route_callbck(null, "Error: " + err);
		} else if (data === null ) {
			route_callbck(null, null);
		} else {
			foodtrucks.remove(foodtruck, data[0].inx, function(err, data) {
				if (err) {
					route_callbck(null, "Error: " + err);
				} else {
					route_callbck("Success", null);
				}
			});
		}
	});
};

var myDB_update_foodtruck = function(foodtruck, attr, route_callbck) {
	foodtrucks.get(foodtruck, function(err, data) {
		if (err) {
			route_callbck(null, "Error: " + err);
		} else if (data === null ) {
			route_callbck(null, null);
		} else {
			foodtrucks.update(foodtruck, data[0].inx, attr, function(err, data) {
				if (err) {
					route_callbck(null, "Error: " + err);
				} else {
					route_callbck("Success", null);
				}
			});
		}
	});
}

/* We define an object with one field for each method. For instance, below we have
   a 'lookup' field, which is set to the myDB_lookup function. In routes.js, we can
   then invoke db.lookup(...), and that call will be routed to myDB_lookup(...). */

var database = { 
  getPassword: myDB_getPassword,
  addUser: myDB_addUser,
  exists: myDB_exists,
  addFoodTruck: myDB_addFoodTruck,
  foodTruckExists: myDB_foodTruck_exists,
  getFoodTrucks: myDB_get_foodTrucks,
  removeFoodTruck: myDB_remove_foodTruck,
  updateFoodTruck: myDB_update_foodtruck
};
                                        
module.exports = database;
                                        
