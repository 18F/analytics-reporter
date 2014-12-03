// Auth to the API and fetch a batch of data.
var models = require('./models'),
    config = require('./config'),
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
        .parse('{"' + URL
            .replace(/\?/g, '')
            .replace(/"/g, '\\"')
            .replace(/&/g, '","')
            .replace(/=/g, '":"') + '"}'
        );
    query.auth = jwt;
    return query;
}

module.exports = {
    //do we really need to init endpoints??
    init_endpoints: function() {
        fs.readFile('analytics_urls.txt', function (err, data) {
            if (err) {throw err; }
            var array = data.toString().split("\n")
            array.pop()
            for (i in array) {
                element = array[i].split("|");
                var doc = new models.Analytics({
                    slug: element[0],
                    apicall: element[1],
                    update_interval: element[3],
                    last_update: 0
                });
                console.log("End Point Generated")
                doc.save()
            }
    })},

    create_and_get: function(err, req, res) {
        jwt.authorize(function(err, result) {
            var query = construct_query(req._parsedUrl.query)
            ga.data.ga.get(query, function(err, result) {
                if (result){
                var doc = new models.Analytics({
                    slug: req._parsedUrl.query,
                    apicall: req._parsedUrl.query,
                    update_interval: 3600000,
                    last_update: 0
                });
                doc.save();
                res.json(result);
                console.log("End Point Generated")
                }
                else{
                    res.status(404).json("The endpoint you attempted to reach does not exist, try a different API call.");
                }
            });
        });
    },

    get_or_update: function(err, res, doc) {
        if (doc) {
            var current_time = (new Date()).getTime();
            console.log(current_time - doc.update_interval > doc.last_update)
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
            res.status(404).json("The endpoint you attempted to reach does not exist, try a different API call.");
        }

    }

};
