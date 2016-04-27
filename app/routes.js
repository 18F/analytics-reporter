// All routes for the app.
var models = require('./models'),
    data = require('./data_update'),
    config = require('../config'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash'),
    r = require('rethinkdb');

module.exports = function(app, models) {


    app.get('/', function (req, res) {
      res.render('index', { });
    });

    /**
    * API to fetch stored reports from ReDB.
    */
    app.get('/api/v1.0/:agency/:report', function(req, res) {
        // Disable caching for requests.
        res.header("Cache-Control", "no-cache, no-store, must-revalidate");
        res.header("Pragma", "no-cache");
        res.header("Expires", 0);
        res.header("Content-Type", "application/json; charset=utf-8");
        var filters = null;
        var results = null;
        var agency = req.params.agency;
        var report = req.params.report;
        var queryParms = req.query;
        var startDate, endDate;

        // ISO format:  YYYY-MM-DD
        if(queryParms.start_date) {
          startDate = new Date(queryParms.start_date);
        } else {
          startDate = new Date();
          // Default date CurrentDate - 1 year.
          startDate.setMonth(startDate.getMonth() - 12);
        }
        
        // Default End Date = Today.
        endDate = (queryParms.end_date) ? new Date(queryParms.end_date) : new Date();

        if(config.db.host.length < 1){
          res.send({'error':'503', 'status':'DB not configured for this endpoint.'});
          return;
        }

        r.connect( {host: config.db.host, port: config.db.port}, function(err, conn) {
            if (err) throw err;

            r.db(config.db.name).table(agency)
             .get(report)('data')
             .hasFields(['date'])
             // If the data has dates, filter by date. 
             // Otherwise, return unfiltered result.
             .do(function(data){
                return r.branch(
                          data.isEmpty(),
                          r.table(agency).get(report)('data'),
                          data.filter(function(dataItem){
                            return dataItem('date').during(startDate, endDate) 
                          })
                        )
            })

            .run(conn, function(err, cursor){
              if (err) {
                res.status(500);
                res.send({'error':'500', 'status':'Error accessing database.'})
                throw err;
              }

              cursor.toArray(function(err, result) {
                  if (err) throw err;
                  results = JSON.stringify(result, null, 2);
                  res.send(results);
              });
            });
        });

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
