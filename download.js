// Downloading infrastructure.

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    url = require('url'),
    fs = require('fs');

var models = require('./models'),
    config = require('./config');

var jwt = new googleapis.auth.JWT(
    config.email,
    config.key,
    null, ['https://www.googleapis.com/auth/analytics.readonly']
);


// The reports we want to run.
var reports = JSON.parse(fs.readFileSync("./reports.json")).reports;
var by_name = {};
for (var i=0; i<reports.length; i++)
    by_name[reports[i].name] = reports[i];

// Google Analytics data fetching and transformation utilities.
// This should really move to its own analytics.js file.
var Analytics = {

    reports: by_name,

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

                // debug: write google output to disk
                // fs.writeFileSync("data/google/" + report.name + ".json", JSON.stringify(result, null, 2));

                callback(null, Analytics.process(report, result));
            });
        });
    },

    // translate 20141228 -> 2014-12-28
    date_format: function(in_date) {
        return [in_date.substr(0,4), in_date.substr(4, 2), in_date.substr(6, 2)].join("-")
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
                date: Analytics.date_format(row[0]),
                visitors: row[1]
            });
        }

        // calculate totals
        result.totals.visitors = data.totalsForAllResults["ga:users"]
        // ga:date should always be the first dimension
        result.totals.start_date = Analytics.date_format(data.rows[0][0]);
        result.totals.end_date = Analytics.date_format(data.rows[data.rows.length-1][0]);

        return result;
    }

};

module.exports = Analytics;
