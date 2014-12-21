// Connect to the database.
var mongo = require("./config").mongo;
require('mongoose').connect('mongodb://' + mongo.host + '/' + mongo.database);

// Define the app, and middleware.
var express = require('express'),
    app = express();
app.use(require('body-parser').json());
app.set('port', process.env.PORT || 3000);


// Attach the routes.
var models = require("./models");
app.get('/', function (req, res) {
    res.send("Hello, world!");
});
require('./routes')(app, models);

//init model
data = require("./data");
data.init_endpoints()

// Boot it up!
var server = app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + server.address().port);
});
