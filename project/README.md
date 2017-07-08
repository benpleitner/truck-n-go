project/css - the css folder just contains the style sheets for the pages.

project/models - provides the backend functionality for the databases that store info on the food trucks, users, and reviews.

project/routes/routes.js - contains the functions for the routes.

project/views - this folder just contains the .ejs files that renders all the different pages. index.ejs is the first screen the user sees when visiting the app, the login and signup pages correspond to login.ejs and signup.ejs respectively, and foodtruck.ejs is the page where all of the food truck information is displayed. foodtruck.ejs uses Google Maps API. The whole app uses express.js and node.js and we store user and food truck information using Amazon DynamoDB.

project/app.js - contains all the routes for each page.

project/config.json - contains the configuration data. Make sure to change this to the correct key ID and access key, which is given on our step by step directions.

project/loader.js - sets up the data.