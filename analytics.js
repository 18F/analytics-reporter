/*
 * Workhorse module for Google Analytics interaction.
 */

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    fs = require('fs');

var config = require('./config');

var jwt = new googleapis.auth.JWT(
    config.email,
    config.key,
    null,
    ['https://www.googleapis.com/auth/analytics.readonly']
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
            dimensions: report.query.dimensions.join(","),
            metrics: report.query.metrics.join(","),
            "start-date": report.query['start-date'],
            "end-date": report.query['end-date']
        }

        // Optional filters.
        if (report.query.filters)
            query.filters = report.query.filters.join(",");

        // Specify the account, and auth token.
        query.ids = config.account.ids;
        query.auth = jwt;

        jwt.authorize(function(err, result) {
            if (err) return callback(err, null);
            ga.data.ga.get(query, function(err, result) {
                if (err) return callback(err, null);

                // debug: write google output to disk
                require("mkdirp").mkdirp("data/google");
                fs.writeFileSync("data/google/" + report.name + ".json", JSON.stringify(result, null, 2));

                callback(null, Analytics.process(report, result));
            });
        });
    },

    // translate 20141228 -> 2014-12-28
    date_format: function(in_date) {
        return [in_date.substr(0,4), in_date.substr(4, 2), in_date.substr(6, 2)].join("-")
    },

    mapping: {
        "ga:date": "date",
        "ga:users": "visitors",
        "ga:sessions": "visits",
        "ga:deviceCategory": "device",
        "ga:operatingSystem": "os",
        "ga:operatingSystemVersion": "os_version"
    },

    // The OSes we care about for the OS breakdown. The rest can be "Other".
    // These are the extract strings used by Google Analytics.
    oses: [
        "Android", "BlackBerry",  "Windows Phone", "iOS",
        "Linux", "Macintosh", "Windows"
    ],

    // The versions of Windows we care about for the Windows version breakdown.
    // The rest can be "Other". These are the exact strings used by Google Analytics.
    windows_versions: [
        "XP", "Vista", "7", "8", "8.1"
    ],

    // Given a report and a raw google response, transform it into our schema.
    process: function(report, data) {
        var result = {
            name: report.name,
            query: report.query,
            meta: report.meta,
            data: [],
            totals: {}
        };

        // Calculate each individual data point.
        for (var i=0; i<data.rows.length; i++) {
            var row = data.rows[i];

            var point = {};
            for (var j=0; j<row.length; j++) {
                var field = Analytics.mapping[data.columnHeaders[j].name];
                var value = row[j];

                if (field == "date")
                    value = Analytics.date_format(value);

                point[field] = value;
            }

            result.data.push(point);
        }

        // Go through those data points to calculate totals.
        // Right now, this is totally report-specific.
        if ("visitors" in result.data[0]) {
            result.totals.visitors = 0;
            for (var i=0; i<result.data.length; i++)
                result.totals.visitors += parseInt(result.data[i].visitors);
        }
        if ("sessions" in result.data[0]) {
            result.totals.sessions = 0;
            for (var i=0; i<result.data.length; i++)
                result.totals.sessions += parseInt(result.data[i].sessions);
        }

        if (report.name == "devices") {
            result.totals.devices = {mobile: 0, desktop: 0, tablet: 0};
            for (var i=0; i<result.data.length; i++)
                result.totals.devices[result.data[i].device] += parseInt(result.data[i].visits);
        }

        if (report.name == "os") {
            // initialize all cared-about OSes to 0
            result.totals.os = {};
            for (var i=0; i<Analytics.oses.length; i++)
                result.totals.os[Analytics.oses[i]] = 0;
            result.totals.os["Other"] = 0;

            for (var i=0; i<result.data.length; i++) {
                var os = result.data[i].os;

                // Bucket any we don't care about under "Other".
                if (Analytics.oses.indexOf(os) < 0)
                    os = "Other";

                result.totals.os[os] += parseInt(result.data[i].visits);
            }
        }

        if (report.name == "windows") {
            // initialize all cared-about versions to 0
            result.totals.os_version = {};
            for (var i=0; i<Analytics.windows_versions.length; i++)
                result.totals.os_version[Analytics.windows_versions[i]] = 0;
            result.totals.os_version["Other"] = 0;

            for (var i=0; i<result.data.length; i++) {
                var version = result.data[i].os_version;

                // Bucket any we don't care about under "Other".
                if (Analytics.windows_versions.indexOf(version) < 0)
                    version = "Other";

                result.totals.os_version[version] += parseInt(result.data[i].visits);
            }
        }

        // presumably we're organizing these by date
        if (result.data[0].date) {
            result.totals.start_date = result.data[0].date;
            result.totals.end_date = result.data[result.data.length-1].date;
        }

        return result;
    }

};

module.exports = Analytics;
