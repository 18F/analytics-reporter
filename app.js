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
app.get('/', function(req, res) {res.send("Hello, world!")});
require('./routes')(app, models);


//initalize database
var fs = require('fs'),
    models = require('./models');
fs.readFile('analytics_urls.txt', function(err, data) {
    if(err) throw err;
    var array = data.toString().split("\n");
    for(i in array) {
        element = array[i].split("|");
        var analytics = new models.Analytics(
            {slug: element[0], apicall: element[1], kind: element[2],
                update_interval: element[3], last_update: 0});
        console.log(analytics)
        analytics.save()
    }
});


// Boot it up!
var server = app.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + server.address().port);
});
