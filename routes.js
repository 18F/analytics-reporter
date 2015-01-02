// All routes for the app.
var models = require('./models'),
    config = require('./config'),
    data = require("./data");

module.exports = function(app, models) {

    app.get('/data/api/', function(req, res) {
        res.send("API Data!");
    });

    app.get('/data/api/specific/:slug', function(req, res) {
        models.Analytics.findOne({
            slug: req.params.slug
        }, function(err, doc) {
            data.get_or_update(err, res, doc)
        });
    });

    app.get('/data/api/custom/', function(req, res) {
        models.Analytics.findOne({
            apicall: req._parsedUrl.query
        }, function(err, doc) {
            if (doc){
                console.log("exists");
                data.get_or_update(err, res, doc);
            }
            else{
                console.log("cache");
                data.create_and_get(err, req, res);
            }
        });
    });

};
