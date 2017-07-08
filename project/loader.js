/* This is a simple example of a program that creates the database and puts some 
   initial data into it. You don't strictly need this (you can always edit the
   database using the DynamoDB console), but it may be convenient, e.g., when you
   need to reset your application to its initial state during testing. */

var AWS = require('aws-sdk');
AWS.config.loadFromPath('./config.json');

var db = new AWS.DynamoDB();
var kvs = require('./models/keyvaluestore.js');

var async = require('async');

/* Here is our initial data. */

var username = "benpleitner";
var valueObj = {
		password: "benjammin",
		fullName: "Ben Leitner"
	};

var foodTruck = "Schmear It";
var restObj = {
    name: "Schmear It",
		latitude: 39.95176845644535,
		longitude: -75.19231259822845,
    creator: "benpleitner",
    review: "No reviews yet"
	};


/* This function uploads our data. Notice the use of 'async.forEach'
   to do something for each element of an array... */

var uploadUser = function(table1, callback) {
		console.log("Adding User: " + username);
		table1.put(username, JSON.stringify(valueObj), function(err, data) {
			if (err)
				console.log("Oops, error when adding "+ username + ": " + err);
		});
	};
	
var uploadFoodTruck = function(table2, callback) {
		console.log("Adding Food Truck: " + foodTruck);
		table2.put(foodTruck, JSON.stringify(restObj), function(err, data) {
			if (err)
				console.log("Oops, error when adding "+ foodTruck + ": " + err);
		});
	};

/* This function does the actual work. Since it needs to perform blocking
   operations at various points (create table, delete table, etc.), it 
   somewhat messily uses itself as a callback, along with a counter to
   distinguish which part of the function is called. In other words, 'i'
   starts out being 0, so the first thing the function does is delete the
   table; then, when that call returns, 'i' is incremented, and the 
   function creates the table; etc. */

var j = 0;

function userSetup(err, data) {
  j++;
  if (err && j != 2) {
    console.log("Error: " + err); 
  } else if (j==1) {
    console.log("Deleting users_nets table if it already exists...");
    params = {
        "TableName": "users_nets"
    };
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...");
      setTimeout(userSetup,10000);
    });
  } else if (j==2) {
    console.log("Creating table users_nets...");
    table1 = new kvs("users_nets");
    table1.init(userSetup);
  } else if (j==3) {
    console.log("Waiting 10s for the table to become active...");
    setTimeout(userSetup,10000);
  } else if (j==4) {
    console.log("Uploading");
    uploadUser(table1, function(){
      console.log("Done uploading!");
    });
  }
}

var k = 0;

function foodTruckSetup(err, data) {
  k++;
  if (err && k != 2) {
    console.log("Error: " + err); 
  } else if (k==1) {
    console.log("Deleting foodtrucks_nets table if it already exists...");
    params = {
        "TableName": "foodtrucks_nets"
    };
    db.deleteTable(params, function(){
      console.log("Waiting 10s for the table to be deleted...");
      setTimeout(foodTruckSetup,10000);
    });
  } else if (k==2) {
    console.log("Creating table foodtrucks_nets...");
    table2 = new kvs("foodtrucks_nets");
    table2.init(foodTruckSetup);
  } else if (k==3) {
    console.log("Waiting 10s for the table to become active...");
    setTimeout(foodTruckSetup, 10000);
  } else if (k==4) {
    console.log("Uploading");
    uploadFoodTruck(table2, function(){
      console.log("Done uploading!");
    });
  }
}

/* So far we've only defined functions - the line below is the first line that
   is actually executed when we start the program. */   

userSetup(null, null);
foodTruckSetup(null, null);