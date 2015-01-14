// All routes for the app.
var models = require('./models'),
    config = require('../config'),
    data = require('./data_update');

module.exports = function(app, models) {

    app.get('/data/api/', function(req, res) {
        res.send("API Data!");
    });

    app.get('/data/api/:name', function(req, res) {
        models.Analytics.findOne({
            name: req.params.name
        }, function(err, doc) {
            data.get_or_update(err, res, doc);
        });
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
