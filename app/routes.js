// All routes for the app.
var models = require('./models'),
    data = require('./data_update'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

module.exports = function(app, models) {

    app.get('/', function (req, res) {
      res.render('index', { });
    });

    app.get('/data/live/', function(req, res) {
        res.send("API Data!");
    });

    app.get('/data/live/:name', function(req, res) {
      // Disable caching for content files
      res.header("Cache-Control", "no-cache, no-store, must-revalidate");
      res.header("Pragma", "no-cache");
      res.header("Expires", 0);
      res.header("Content-Type", "application/json; charset=utf-8");

      var filters = null;
      var name = req.params.name;
      if (_.endsWith(name, ".json")) {
        name = name.substring(0, name.length-5);
      }
      var modelName = name;
      if (req.query.title) {
        modelName += '-' + req.query.title.toLowerCase().trim()
      }
      var doc = models.data[modelName];
      if (!doc) {
        models.data[modelName] = _.cloneDeep(models.data[name]);
        doc = models.data[modelName];
        doc.name = modelName;
        doc.last_update = 0;
      }
      doc.filters = null;
      if (req.query.title) {
        if (doc.realtime) {
          filters = 'rt:';
        } else {
          filters = 'ga:';
        }
        filters += 'pageTitle=~' + req.query.title;
      }
      if (filters) {
        doc.filters = [ filters ];
      }
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
