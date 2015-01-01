// download

var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    url = require('url'),
    fs = require('fs');

var models = require('../models'),
    config = require('../config');

var jwt = new googleapis.auth.JWT(
    config.email,
    '../secret_key.pem',
    null, ['https://www.googleapis.com/auth/analytics.readonly']
);


// The reports we want to run.
var reports = require("./reports").reports;

// Google Analytics data fetching and transformation utilities
var Analytics = {

    query: function(report, callback) {

        // insert IDs and auth data
        report.ids = config.account.ids;
        report.auth = jwt;

        jwt.authorize(function(err, result) {
            ga.data.ga.get(report, function(err, result) {
                if (err) return callback(err, null);
                // TODO: transform, then return transformed data
                callback(null, result);
            });
        });
    },



};

module.exports = Analytics;

// TODO: Testing
// Analytics.query(reports[0], function(err, data) {
//     console.log(arguments);
// })
