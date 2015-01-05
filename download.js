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

        // Insert IDs and auth data. Dupe the object so it doesn't
        // modify the report object for later work.
        var query = {
            dimensions: report.query.dimensions,
            metrics: report.query.metrics,
            "start-date": report.query['start-date'],
            "end-date": report.query['end-date']
        }
        query.ids = config.account.ids;
        query.auth = jwt;

        jwt.authorize(function(err, result) {
            if (err) return callback(err, null);
            ga.data.ga.get(query, function(err, result) {
                if (err) return callback(err, null);
                callback(null, Analytics.process(report, result));
            });
        });
    },

    path: function(report) {
        return "data/" + report.name + ".json";
    },

    // Given a report and a raw google response, transform it into our schema.
    process: function(report, data) {
        var result = {
            name: report.name,
            query: report.query,
            meta: report.meta,
            data: [],
            totals: {}
        };

        // only valid for ga:date by ga:users
        for (var i=0; i<data.rows.length; i++) {
            var row = data.rows[i];

            result.data.push({
                date: row[0],
                visitors: row[1]
            });
        }

        // calculate totals
        result.totals.visitors = data.totalsForAllResults["ga:users"]
        // ga:date should always be the first dimension
        result.totals.start_date = data.rows[0][0];
        result.totals.end_date = data.rows[data.rows.length-1][0];

        return result;
    }

};

module.exports = Analytics;

/*  Actually download the files. This should be separated from the above
    modules at some point.
*/

for (var i=0; i<reports.length; i++) {
    var report = reports[i];

    console.log("\n[" + report.name + "] Fetching...");
    Analytics.query(report, function(err, data) {
        if (err) return console.log("ERROR: " + JSON.stringify(err));

        console.log("[" + report.name + "] Saving report data...");
        var json = JSON.stringify(data, null, 2);
        fs.writeFileSync(Analytics.path(report), json);

        console.log("[" + report.name + "] Done.");
    });
}
