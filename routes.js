// All routes for the app.
var models = require('./models'),
    config = require('./config'),
    data = require("./data");

module.exports = function(app, models) {

    app.get('/data/api/general/', function(req, res) {
        res.send("API general!");
    });

    app.get('/data/api/general/:slug', function(req, res) {
        models.Analytics.findOne({
            slug: req.params.slug,
            kind: "general"
        }, function(err, doc) {
            if (doc) {
                res.json(doc.data);
            } else {
                res.send("No Data")
            }
        });
    });

    app.get('/data/api/specific/', function(req, res) {
        res.send("API specific!");
    });

    app.get('/data/api/specific/:slug', function(req, res) {
        models.Analytics.findOne({
            slug: req.params.slug,
            kind: "specific"
        }, function(err, doc) {
            data.get_or_update(err, res, doc)
        });
    });

};
