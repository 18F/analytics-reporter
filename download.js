// Downloading infrastructure.

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    url = require('url'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

var models = require('./models'),
    config = require('./config');

var jwt = new googleapis.auth.JWT(
    config.email,
    'secret_key.pem',
    null, ['https://www.googleapis.com/auth/analytics.readonly']
);


// The reports we want to run.
var reports = JSON.parse(fs.readFileSync("./reports.json")).reports;

// Google Analytics data fetching and transformation utilities.
// This should really move to its own analytics.js file.
var Analytics = {

    query: function(report, callback) {

        // insert IDs and auth data
        var query = report.query;
        query.ids = config.account.ids;
        query.auth = jwt;

        jwt.authorize(function(err, result) {
            ga.data.ga.get(query, function(err, result) {
                if (err) return callback(err, null);
                // TODO: transform, then return transformed data
                callback(null, result);
            });
        });
    },

    // type is "original" or "processed"
    path: function(type, report) {
        return "data/" + type + "/" + report.name + ".json";
    },

    // given a raw google analytics response, transform it into our schema
    // TODO: way more thoughtful about this - and possibly report-specific.
    process: function(data) {
        return {
            rows: data.rows,
            columnHeaders: data.columnHeaders
        }
    }

};

module.exports = Analytics;

/*  Actually download the files. This should be separated from the above
    modules at some point.
*/

mkdirp.sync("data/original");
mkdirp.sync("data/processed");

for (var i=0; i<reports.length; i++) {
    var report = reports[i];

    console.log("\n[" + report.name + "] Fetching...");
    Analytics.query(report, function(err, original) {
        if (err) return console.log("ERROR: " + err);

        // pretty printed raw Google Analytics data
        console.log("[" + report.name + "] Saving original...");
        var originalJSON = JSON.stringify(original, null, 2);
        fs.writeFileSync(Analytics.path("original", report), originalJSON);

        // transform to our format
        console.log("[" + report.name + "] Saving processed...");
        var processed = Analytics.process(original);
        var processedJSON = JSON.stringify(processed, null, 2);
        fs.writeFileSync(Analytics.path("processed", report), processedJSON);

        console.log("[" + report.name + "] Done.");
    });
}
