/*
 * Workhorse module for Google Analytics interaction.
 */

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    fs = require('fs'),
    path = require('path');

var config = require('./config');

var jwt = new googleapis.auth.JWT(
    config.email,
    config.key,
    null,
    ['https://www.googleapis.com/auth/analytics.readonly']
);


// The reports we want to run.
var reports_path = path.join(__dirname, "reports.json");
var reports = JSON.parse(fs.readFileSync(reports_path)).reports;
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
        var query = {};

        if (report.query.dimensions)
            query.dimensions = report.query.dimensions.join(",");

        if (report.query.metrics)
            query.metrics = report.query.metrics.join(",");

        if (report.query['start-date'])
            query["start-date"] = report.query['start-date'];
        if (report.query['end-date'])
            query["end-date"] = report.query['end-date'];

        // never sample data - this should be fine
        query['samplingLevel'] = "HIGHER_PRECISION";

        // Optional filters.
        if (report.query.filters)
            query.filters = report.query.filters.join(",");

        query['max-results'] = report.query['max-results'] || 10000;

        if (report.query['sort'])
            query['sort'] = report.query['sort'];


        // Specify the account, and auth token.
        query.ids = config.account.ids;
        query.auth = jwt;

        var api_call;
        if (report.realtime)
            api_call = ga.data.realtime.get;
        else
            api_call = ga.data.ga.get;

        jwt.authorize(function(err, result) {
            if (err) return callback(err, null);

            api_call(query, function(err, result) {
                if (err) return callback(err, null);

                if (config.debug)
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
        "ga:hour": "hour",
        "ga:users": "visitors",
        "rt:activeUsers": "active_visitors",
        "rt:pagePath": "page",
        "rt:pageTitle": "page_title",
        "ga:sessions": "visits",
        "ga:deviceCategory": "device",
        "ga:operatingSystem": "os",
        "ga:operatingSystemVersion": "os_version",
        "ga:hostname": "domain",
        "ga:browser" : 'browser',
        "ga:browserVersion" : "browser_version",
        "ga:source": "source"
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

    // The browsers we care about for the browser report. The rest are "Other"
    //  These are the exact strings used by Google Analytics.
    browsers: [
        "Internet Explorer", "Chrome", "Safari", "Firefox", "Android Browser",
        "Safari (in-app)", "Amazon Silk", "Opera", "Opera Mini",
        "IE with Chrome Frame", "BlackBerry", "UC Browser"
    ],

    // The versions of IE we care about for the IE version breakdown.
    // The rest can be "Other". These are the exact strings used by Google Analytics.
    ie_versions: [
        "11.0", "10.0", "9.0", "8.0", "7.0", "6.0"
    ],


    // Given a report and a raw google response, transform it into our schema.
    process: function(report, data) {
        var result = {
            name: report.name,
            query: data.query,
            meta: report.meta,
            data: [],
            totals: {}
        };

        // this is destructive to the original data, but should be fine
        delete result.query.ids;

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
        if ("visits" in result.data[0]) {
            result.totals.visits = 0;
            for (var i=0; i<result.data.length; i++)
                result.totals.visits += parseInt(result.data[i].visits);
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

        if (report.name == "browsers") {

            result.totals.browser = {};
            for (var i=0; i<Analytics.browsers.length; i++)
                result.totals.browser[Analytics.browsers[i]] = 0;
            result.totals.browser["Other"] = 0;

            for (var i=0; i<result.data.length; i++) {
                var browser = result.data[i].browser;

                if (Analytics.browsers.indexOf(browser) < 0)
                    browser = "Other";

                result.totals.browser[browser] += parseInt(result.data[i].visits);
            }
        }

        if (report.name == "ie") {
            // initialize all cared-about versions to 0
            result.totals.ie_version = {};
            for (var i=0; i<Analytics.ie_versions.length; i++)
                result.totals.ie_version[Analytics.ie_versions[i]] = 0;
            result.totals.ie_version["Other"] = 0;

            for (var i=0; i<result.data.length; i++) {
                var version = result.data[i].browser_version;

                // Bucket any we don't care about under "Other".
                if (Analytics.ie_versions.indexOf(version) < 0)
                    version = "Other";

                result.totals.ie_version[version] += parseInt(result.data[i].visits);
            }
        }

        // presumably we're organizing these by date
        if (result.data[0].date) {
            result.totals.start_date = result.data[0].date;
            result.totals.end_date = result.data[result.data.length-1].date;
        }

        // datestamp all reports, will be serialized in JSON as ISO 8601
        result.taken_at = new Date();

        return result;
    }

};

module.exports = Analytics;
