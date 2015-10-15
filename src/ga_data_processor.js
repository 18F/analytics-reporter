
var  config = require('./config'),
_ = require('lodash');


var GoogleAnalyticsProcessor = {

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
        "ga:source": "source",
        "ga:pagePath": "page",
        "ga:pageTitle": "page_title",
        "ga:pageviews": "visits",
        "ga:country": "country",
        "ga:city": 'city',
        "ga:eventLabel": "event_label",
        "ga:totalEvents": "total_events",
        "rt:country": "country",
        "rt:city": "city",
        "rt:totalEvents": "total_events",
        "rt:eventLabel": "event_label"
    },

    // The OSes we care about for the OS breakdown. The rest can be "Other".
    // These are the extract strings used by Google GoogleAnalyticsProcessor.
    oses: [
        "Android", "BlackBerry",  "Windows Phone", "iOS",
        "Linux", "Macintosh", "Windows"
    ],

    // The versions of Windows we care about for the Windows version breakdown.
    // The rest can be "Other". These are the exact strings used by Google GoogleAnalyticsProcessor.
    windows_versions: [
        "XP", "Vista", "7", "8", "8.1"
    ],

    // The browsers we care about for the browser report. The rest are "Other"
    //  These are the exact strings used by Google GoogleAnalyticsProcessor.
    browsers: [
        "Internet Explorer", "Chrome", "Safari", "Firefox", "Android Browser",
        "Safari (in-app)", "Amazon Silk", "Opera", "Opera Mini",
        "IE with Chrome Frame", "BlackBerry", "UC Browser"
    ],

    // The versions of IE we care about for the IE version breakdown.
    // The rest can be "Other". These are the exact strings used by Google GoogleAnalyticsProcessor.
    ie_versions: [
        "11.0", "10.0", "9.0", "8.0", "7.0", "6.0"
    ],


    // Given a report and a raw google response, transform it into our schema.
    process: function(report, data) {
      console.log(report, data)
        var result = {
            name: report.name,
            query: data.query,
            meta: report.meta,
            data: [],
            totals: {}
        };

        // this is destructive to the original data, but should be fine
        delete result.query.ids;

        // If you use a filter that results in no data, you get null
        // back from google and need to protect against it.
        if (!data || !data.rows) {
          return result;
        }

        // datestamp all reports, will be serialized in JSON as ISO 8601
        result.taken_at = new Date();

        // data.rows is missing if there are no results
        if (data.totalResults > 0) {

            // Calculate each individual data point.
            for (var i=0; i<data.rows.length; i++) {
                var row = data.rows[i];

                var point = {};
                for (var j=0; j<row.length; j++) {

                    // Some reports may decide to cut fields from the output.
                    if (report.cut && _.contains(report.cut, data.columnHeaders[j].name))
                        continue;

                    var field = GoogleAnalyticsProcessor.mapping[data.columnHeaders[j].name] || data.columnHeaders[j].name;
                    var value = row[j];

                    if (field == "date")
                        value = GoogleAnalyticsProcessor.date_format(value);

                    point[field] = value;
                }

                if (report.realtime && config.account.hostname)
                  point.domain = config.account.hostname;

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

            if (_.startsWith(report.name, "devices")) {
                result.totals.devices = {mobile: 0, desktop: 0, tablet: 0};
                for (var i=0; i<result.data.length; i++)
                    result.totals.devices[result.data[i].device] += parseInt(result.data[i].visits);
            }

            if (_.startsWith(report.name, "os")) {
                // initialize all cared-about OSes to 0
                result.totals.os = {};
                for (var i=0; i<GoogleAnalyticsProcessor.oses.length; i++)
                    result.totals.os[GoogleAnalyticsProcessor.oses[i]] = 0;
                result.totals.os["Other"] = 0;

                for (var i=0; i<result.data.length; i++) {
                    var os = result.data[i].os;

                    // Bucket any we don't care about under "Other".
                    if (GoogleAnalyticsProcessor.oses.indexOf(os) < 0)
                        os = "Other";

                    result.totals.os[os] += parseInt(result.data[i].visits);
                }
            }

            if (_.startsWith(report.name, "windows")) {
                // initialize all cared-about versions to 0
                result.totals.os_version = {};
                for (var i=0; i<GoogleAnalyticsProcessor.windows_versions.length; i++)
                    result.totals.os_version[GoogleAnalyticsProcessor.windows_versions[i]] = 0;
                result.totals.os_version["Other"] = 0;

                for (var i=0; i<result.data.length; i++) {
                    var version = result.data[i].os_version;

                    // Bucket any we don't care about under "Other".
                    if (GoogleAnalyticsProcessor.windows_versions.indexOf(version) < 0)
                        version = "Other";

                    result.totals.os_version[version] += parseInt(result.data[i].visits);
                }
            }

            if (_.startsWith(report.name, "browsers")) {

                result.totals.browser = {};
                for (var i=0; i<GoogleAnalyticsProcessor.browsers.length; i++)
                    result.totals.browser[GoogleAnalyticsProcessor.browsers[i]] = 0;
                result.totals.browser["Other"] = 0;

                for (var i=0; i<result.data.length; i++) {
                    var browser = result.data[i].browser;

                    if (GoogleAnalyticsProcessor.browsers.indexOf(browser) < 0)
                        browser = "Other";

                    result.totals.browser[browser] += parseInt(result.data[i].visits);
                }
            }

            if (_.startsWith(report.name, "ie")) {
                // initialize all cared-about versions to 0
                result.totals.ie_version = {};
                for (var i=0; i<GoogleAnalyticsProcessor.ie_versions.length; i++)
                    result.totals.ie_version[GoogleAnalyticsProcessor.ie_versions[i]] = 0;
                result.totals.ie_version["Other"] = 0;

                for (var i=0; i<result.data.length; i++) {
                    var version = result.data[i].browser_version;

                    // Bucket any we don't care about under "Other".
                    if (GoogleAnalyticsProcessor.ie_versions.indexOf(version) < 0)
                        version = "Other";

                    result.totals.ie_version[version] += parseInt(result.data[i].visits);
                }
            }
            if (_.startsWith(report.name, "top-countries")) {
                // Extract the total visits from the `United States`
                for (var i=0; i < result.data.length; i++) {
                    if (result.data[i].country === "United States") {
                        result.totals.us_visits = result.data[i].visits;
                    }
                }

            }

            // presumably we're organizing these by date
            if (result.data[0].date) {
                result.totals.start_date = result.data[0].date;
                result.totals.end_date = result.data[result.data.length-1].date;
            }
        }
        return result;
    }

};

module.exports = GoogleAnalyticsProcessor;
