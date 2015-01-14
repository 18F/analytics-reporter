// Auth to the API and fetch a batch of data.
var models = require('./models'),
    config = require('../config'),
    googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    url = require('url'),
    fs = require('fs');

var jwt = new googleapis.auth.JWT(
    config.email,
    'secret_key.pem',
    null, ['https://www.googleapis.com/auth/analytics.readonly']
);

// constructs a query based on apicall url in the document
function construct_query(URL) {
    var query = JSON
        .parse('{"' + decodeURI(url.parse(URL).search)
            .replace(/\?/g, '')
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') + '"}'
        );
    query.auth = jwt;
    return query;
}

module.exports = {

    init_endpoints: function() {
        fs.readFile('analytics_urls.txt', function (err, data) {
            if (err) {throw err; }
            var array = data.toString().split("\n");
            for (i in array) {
                element = array[i].split("|");
                var analytics = new models.Analytics({
                    slug: element[0],
                    apicall: element[1],
                    update_interval: element[3],
                    last_update: 0
                });
                console.log("End Point Generated")
                analytics.save()
            }
    })},

    //update with a cache
    create_and_get: function(err, req, res) {
        jwt.authorize(function(err, result) {
            var query = construct_query("https://www.googleapis.com/analytics/v3/data/ga?" + req.params.apicall);
            ga.data.ga.get(query, function(err, result) {
                res.json(result);
            });
        });
    },

    get_or_update: function(err, res, doc) {
        if (doc) {
            var current_time = (new Date()).getTime();

            if (current_time - doc.update_interval > doc.last_update) {
                console.log("update");
                jwt.authorize(function(err, result) {
                    var query = construct_query(doc.apicall);
                    ga.data.ga.get(query, function(err, result) {
                        doc.data = result;
                        doc.last_update = current_time;
                        doc.save();
                        res.json(doc.data);
                    });
                });
            } else {
                console.log("leave it")
                res.json(doc);
            }
        } else {
            res.send("No Data")
        }

    }

};
