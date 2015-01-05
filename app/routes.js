// All routes for the app.
var models = require('./models'),
    config = require('./config'),
    data = require("./data");

module.exports = function(app, models) {

    app.get('/data/api/', function(req, res) {
        res.send("API Data!");
    });

    app.get('/data/api/:slug', function(req, res) {
        models.Analytics.findOne({
            slug: req.params.slug
        }, function(err, doc) {
            data.get_or_update(err, res, doc)
        });
    });

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

};
