// All routes for the app.
var models = require('./models'),
    data = require('./data_update'),
    path = require('path');

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
}

module.exports = function(app, models) {

    app.get('/data/live/', function(req, res) {
        res.send("API Data!");
    });

    app.get('/data/live/:name', function(req, res) {
      var name = req.params.name;
      if (name.endsWith(".json")) {
        name = name.substring(0, name.length-5);
      }
      var doc = models.data[name];
      data.get_or_update(null, res, doc);
    });

};


/*  //functionality for custom api calls
    app.get('/data/api/custom/:apicall', function(req, res) {
        models.Analytics.findOne({
            apicall: req.params.apicall
        }, function(err, doc) {
            if (doc){
                data.get_or_update(err, res, doc);
            }
            else{
                data.create_and_get(err, req, res);
            }
        });
    });
*/
