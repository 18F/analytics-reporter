/*
Functionality for making api call to google analytics
*/
var googleapis = require('googleapis'),
  ga = googleapis.analytics('v3'),
  jwt = googleapis.auth.JWT,
  fs = require('fs'),
  GoogleAnalyticsProcessor = require("./ga_data_processor.js");


/* The googleapis client seprates the authorization and the api call
functionality this method combines them to create one entry point to
the google analytics data */
function GoogleAnalyticsApi(key, email, debug) {
  this.debug = debug;
  this.authorization = new jwt(
    email,
    null,
    key, ['https://www.googleapis.com/auth/analytics.readonly']
  );
}

/* fetchData chooses the correct api endpoint (realtime or standard ga and also
binds the authorization to the query */
GoogleAnalyticsApi.prototype.fetchData = function(query, report, callback) {
  // Choose correct endpoint
  var api_call;
  if (query.realtime) {
    if (this.debug) console.log("Using realtime Google Analytics endpoint");
    api_call = ga.data.realtime.get;
  } else {
    if (this.debug) console.log("Using standard Google Analytics endpoint");
    api_call = ga.data.ga.get;
  }
  // Bind authorization to query
  query.auth = this.authorization;
  this.authorization.authorize(function(err, _) {
    if (err) return callback(err, null);
    if (this.debug) console.log("Request authorized");
    api_call(query, function(err, data) {
      if (err) return callback(err, null);
      if (this.debug) console.log("Data retrived from Google Analytics");
      callback(null, GoogleAnalyticsProcessor.process(report, data));
    });
  });
};

module.exports = GoogleAnalyticsApi;
