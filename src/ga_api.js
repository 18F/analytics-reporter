/*
Functionality for making api call to google analytics
*/
var googleapis = require('googleapis'),
    ga = googleapis.analytics('v3'),
    jwt = googleapis.auth.JWT,
    fs = require('fs'),
    GoogleAnalyticsProcessor = require("./ga_data_processor.js"),
    config = require('./config');

/* The googleapis client seprates the authorization and the api call
functionality this method combines them to create one entry point to
the google analytics data */
function GoogleAnalyticsApi () {
  var key;
  if (config.key)
      key = config.key;
  else if (config.key_file && fs.existsSync(config.key_file))
      key = fs.readFileSync(config.key_file);
  else
    key = null;
  this.authorization = new jwt(
      config.email,
      null,
      key,
      ['https://www.googleapis.com/auth/analytics.readonly']
  );
}


GoogleAnalyticsApi.prototype.fetchData = function (query, report, callback) {
  var api_call;
  if (query.realtime) {
    api_call = ga.data.realtime.get;
  } else {
    api_call = ga.data.ga.get;
  }
  // Bind authorization to query
  query.auth = this.authorization;
  this.authorization.authorize(function(err, _) {
      if (err) return callback(err, null);
      api_call(query, function(err, data) {
          if (err) return callback(err, null);
          callback(null, GoogleAnalyticsProcessor.process(report, data));
      });
  });
};

module.exports = GoogleAnalyticsApi;
