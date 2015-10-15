var GoogleAnalyticsApi = require("./ga_api.js"),
    fs = require('fs'),
    path = require('path'),
    config = require('./config');

function Analytics(api, reports_path) {
    /* Function constructor for the main Analytics object.
    This constructor initalizes the reports path and the the API client to
    Google analytics*/
    this.api = new api();
    reports_path = config.reports_file || (path.join(__dirname, reports_path));
    var reports = JSON.parse(fs.readFileSync(reports_path)).reports;
    this.by_name = {};
    for (var i=0; i<reports.length; i++)
        this.by_name[reports[i].name] = reports[i];
}


Analytics.prototype.query = function (report, callback) {
  /* This prototype method injests a report and prepares a query
  object used to fetch data from the api */

  if (!report)
    return callback("Report not defined", null);

  var query = {};
  query.ids = config.account.ids;

  if (report.query.dimensions)
      query.dimensions = report.query.dimensions.join(",");

  if (report.query.metrics)
      query.metrics = report.query.metrics.join(",");

  if (report.query['start-date'])
      query["start-date"] = report.query['start-date'];
  if (report.query['end-date'])
      query["end-date"] = report.query['end-date'];

  // never sample data - this should be fine
  query.samplingLevel = "HIGHER_PRECISION";

  // Optional filters.
  var filters = [];
  if (report.query.filters)
      filters = filters.concat(report.query.filters);

  if (report.filters)
      filters = filters.concat(report.filters);

  if (filters.length > 0)
      query.filters = filters.join(";");

  query['max-results'] = report.query['max-results'] || 10000;

  if (report.query.sort)
      query.sort = report.query.sort;

  if (report.realtime)
    query.realtime = true;

  analytics.api.fetchData(query, report, callback);

};


var analytics = new Analytics(GoogleAnalyticsApi, "../reports/reports.json");

analytics.query(analytics.by_name['top-cities-30-days'], function(err, data) {
  console.log(err, data);
});

analytics.query(analytics.by_name['realtime'], function(err, data) {
  console.log(err, data);
});
