var db = require('../models/database.js');

var getMain = function(req, res) {
	res.render('index.ejs', {message: null});
}

var getLogin = function(req, res) {
	//Render the login page
	res.render('login.ejs', {message: null});
};

var postLoginResults = function(req, res) {
	//Obtain information from the form
	var username = req.body.usernameInputField;
	var password = req.body.passwordInputField;
	
	//Get the password for the user for validation
	db.getPassword(username, function(data, err) {
		//Check if a field was not filled out
		if (username === "" || password === "") {
			res.render('login.ejs', {message: "Please fill out all fields"});
		} else if (err) { //Further error checking
			res.render('login.ejs', {message: err});
		} else if (data) { //Check that the input password matches
			if (data.password == password) {
				req.session.user = username;
				res.redirect('/foodtrucks'); //Go to the food trucks page
			} else {
				//Send back to the login page if password doesn't match
				res.render('login.ejs', {
					message: 'Wrong password was entered'
				});
			}
		} else {
			//Send back to the login page if the user does not exist
			res.render('login.ejs', {
				message: 'The user name you entered is not registered'
			});
		}
	});
};

var createAccount = function(req, res) {
	//Obtain information from the form
	var username = req.body.usernameInputField;
	var password = req.body.passwordInputField;
	var fullname = req.body.fullnameInputField;
		
	db.exists(username, function(data, err) {
		//Check if a field was not filled out
		if (username === "" || password === "" || fullname === "") {
			res.render('signup.ejs', {message: "Please fill out all fields"});
		} else if (err) { //Further error check
			res.render('signup.ejs', {message: er});
		} else if (data === null){
			//Add the user to the users table
			db.addUser(username, password, fullname, function(data, err) {
				if (err) { //Error check
					res.render('signup.ejs', {message: "Please fill out all fields"});
				} else if (data) {
					if (data.message == "success") {
						//Create a session
						req.session.user = username;
						res.redirect('/foodtrucks');
					}
				} else {
					res.render('signup.ejs', {
						message: 'Fill in the form again'
					});
				}
			});
		} else if (data) {
			//Check if the user already exists
			if (data.message == "user already exists") {
				//Go back to signup page
				res.render('signup.ejs', {
					message: 'user name already exists'
				});
			}
		}		
	});
};

var addFoodTruck = function(req, res) {
	//Obtain information from the form
	var latitude = req.body.latitude;
	var longitude = req.body.longitude;
	var name = req.body.name;
	// var description = req.body.description;
	
	//Get all the data in the restaurants table
	db.getFoodTrucks(function(data, err) {
		//Store the restaurant data
		var foodTruckData = data;
		db.foodTruckExists(name, function(data, err) {
			//Check if a field was not filled out
			if (latitude === "" || longitude === "" || name === "") {
				res.send({
					error: 'Please fill out all fields',
					user: req.session.user
				});
//				res.render('restaurants.ejs', {message: "Please fill out all fields",
//					data: restaurantData});
			} else if (isNaN(latitude) || isNaN(longitude)) {
				res.send({
					error: 'Enter a valid number for latitude and longitude',
					user: req.session.user
				});
//				res.render('restaurants.ejs', {
//					message: "Enter a valid number for latitude and longitude",
//					data: restaurantData
//					});
			} else if (err) { //Further error check
				db.addFoodTruck(latitude, longitude, name, req.session.user, function(data, err) {
					if (data) {
						if (data.message == "success") {
							res.send({
									error: null,
									user: req.session.user
							});
//							res.redirect('/restaurants');
						}
					} else {
						res.send({
							error: 'Fill in the form again',
							user: req.session.user
						});
//						res.render('restaurants.ejs', {
//							message: 'Fill in the form again',
//							data: restaurantData
//						});
					}
				});

				// TODO: WORK ON THIS ERROR
				// res.send({
				// 	error: 'Sorry, there was an error. Please fill out the form again.',
				// 	user: req.session.user
				// });

//				res.render('restaurants.ejs', {message: err,
//					data: restaurantData});
			} else if (data === null) { //The restaurant doesn't exist
				db.addFoodTruck(latitude, longitude, name, req.session.user, function(data, err) {
					if (data) {
						if (data.message == "success") {
							res.send({
									error: null,
									user: req.session.user
							});
//							res.redirect('/restaurants');
						}
					} else {
						res.send({
							error: 'Fill in the form again',
							user: req.session.user
						});
//						res.render('restaurants.ejs', {
//							message: 'Fill in the form again',
//							data: restaurantData
//						});
					}
				});
			} else if (data) { //The restaurant does exist
				if (data.message == "food truck has already been added") {
					res.send({
						error: 'food truck has already been added',
						user: req.session.user
					});
//					res.render('restaurants.ejs', {
//						message: 'restaurant has already been added',
//						data: restaurantData
//					});
				}
			}		
		});
	});
};


var getSignUp = function(req, res) {
	res.render('signup.ejs', {message: null});
};

var getFoodTrucks = function(req, res) {
	//Only render if there is a user session
	if (req.session.user === undefined) {
		res.redirect('/');
	} else {
		//Get all the data in the restaurants table
		db.getFoodTrucks(function(data, err) {
			res.render('foodtrucks.ejs', {message: null, data: data});
		});
	}
};

var logout = function(req, res) {
	//End the user session
	req.session.destroy();
	
	//Return to the login page
	res.redirect('/');
};

var removeFoodTruck = function(req, res) {
	db.removeFoodTruck(req.body.keyword, function(data, err) {
		if (err) {
			res.send({
				error: 'Error',
				message: null
			});
		} else {
			res.send({
				error: null,
				message: "Successfully removed!"
			});
		}
	});
};

var updateFoodTruck = function(req, res) {
	var attr = {};

	var dateArr = Date().split(" ");
	var date = dateArr[4].split(":")[0] + ":" + dateArr[4].split(":")[1] + " " + dateArr[1] + " " + dateArr[2];

	attr['name'] = req.body.name;
	attr['latitude'] = req.body.latitude;
	attr['longitude'] = req.body.longitude;
	attr['creator'] = req.body.creator;
	attr['review'] = req.body.review + ":" + req.session.user + ":" + date + ":0";

	db.updateFoodTruck(req.body.name, attr, function(data, err) {
		if (err) {
			res.send({
				error: "error",
				data: null
			})
		} else {
			res.send({
				error: null,
				data: "success"
			});
		}
	});
}

var downVoteFoodTruck = function(req, res) {
	var attr = {};

	attr['name'] = req.body.name;
	attr['latitude'] = req.body.latitude;
	attr['longitude'] = req.body.longitude;
	attr['creator'] = req.body.creator;
	attr['review'] = req.body.review;

	db.updateFoodTruck(req.body.name, attr, function(data, err) {
		if (err) {
			res.send({
				error: "error",
				data: null
			})
		} else {
			res.send({
				error: null,
				data: "success"
			});
		}
	});
}

var gatherData = function(req, res) {
	db.getFoodTrucks(function(data, err) {
		for (var i = 0; i < data.length; i++) {
			if (data[i] != undefined) {
				console.log("FOODTRUCK: " + data[i].key);

				var noLine = [];
				var lessThanFive = [];
				var fiveToTen = [];
				var tenToTwenty = [];
				var twentyPlus = []

				for (var k = 0; k < 24; k++) {
					noLine[k] = 0;
					lessThanFive[k] = 0;
					fiveToTen[k] = 0;
					tenToTwenty[k] = 0;
					twentyPlus[k] = 0;
				}

				var reviews = JSON.parse(data[i].vals)["review"].split(",");

				for (var j = 1; j < reviews.length; j++) {
					var hour = parseInt(reviews[j].split(":")[2]);
					var min = parseInt(reviews[j].split(":")[3].split(" ")[0]);
					var content = reviews[j].split(":")[0]

					if (content == "No Line") {
						noLine[hour] += 1;
					} else if (content == "Less than 5") {
						lessThanFive[hour] += 1;
					} else if (content == "5-10") {
						fiveToTen[hour] += 1;
					} else if (content == "10-20") {
						tenToTwenty[hour] += 1;
					} else if (content == "20+") {
						twentyPlus[hour] += 1;
					}
				}

				console.log("[Hour, No Line, Less than 5, 5-10, 10-20, 20+],");
				for (var k = 0; k < 24; k++) {
					console.log("[new Date(2016,4,25," + k + ",0,0)" + ", " + noLine[k] + ", " + lessThanFive[k] + ", " +
						fiveToTen[k] + ", " + tenToTwenty[k] + ", " + twentyPlus[k] + "],");
				}

				console.log("\n\n");
			}
		}

		// for (var i = 0; i < data.length; i++) {
		// 	if (data[i] != undefined) {
		// 		console.log("FOODTRUCK: " + data[i].key);
		// 		// "Halal", "The Real Le Anh", "Real Le Anh"

		// 		var mostRecentHalalNum = 0;
		// 		var mostRecentTheRealLeAnhNum = 0;
		// 		var mostRecentRealLeAnhNum = 0.

		// 		var reviews = JSON.parse(data[i].vals)["review"].split(",");

		// 		for (var j = 1; j < reviews.length; j++) {
		// 			var hour = parseInt(reviews[j].split(":")[2]);
		// 			var min = parseInt(reviews[j].split(":")[3].split(" ")[0]);
		// 			var content = reviews[j].split(":")[0]

		// 			if (content == "No Line") {
		// 				noLine[hour] += 1;
		// 			} else if (content == "Less than 5") {
		// 				lessThanFive[hour] += 1;
		// 			} else if (content == "5-10") {
		// 				fiveToTen[hour] += 1;
		// 			} else if (content == "10-20") {
		// 				tenToTwenty[hour] += 1;
		// 			} else if (content == "20+") {
		// 				twentyPlus[hour] += 1;
		// 			}
		// 		}

		// 		console.log("[Hour, No Line, Less than 5, 5-10, 10-20, 20+],");
		// 		for (var k = 0; k < 24; k++) {
		// 			console.log("[" + k + ", " + noLine[k] + ", " + lessThanFive[k] + ", " +
		// 				fiveToTen[k] + ", " + tenToTwenty[k] + ", " + twentyPlus[k] + "],");
		// 		}

		// 		console.log("\n\n");
		// 	}
		// }
	});
}

// JSON.parse(restaurantData[i].vals)["review"]

var routes = {
  splash_page: getMain,
  get_login: getLogin,
  post_login_results: postLoginResults,
  sign_up: getSignUp,
  foodtrucks: getFoodTrucks,
  post_create_account: createAccount,
  add_foodtruck: addFoodTruck,
  logout: logout,
  remove_foodtruck: removeFoodTruck,
  update_foodtruck: updateFoodTruck,
  downvote_foodtruck: downVoteFoodTruck,
  gather_data: gatherData
};

module.exports = routes;
