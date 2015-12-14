var GoogleAnalyticsApi = require("./ga_api.js"),
    fs = require('fs'),
    path = require('path'),
    config = require('./config'),
    async = require("async"),
    csv = require("fast-csv"),
    zlib = require('zlib'),
    AWS = require("aws-sdk");


/* Analytics is the function constructor for the main Analytics object.
This constructor initalizes the reports path and the the API client to
Google analytics*/
function Analytics(key, email, account_ids, reports_path, debug) {

    // Load Key
    key = key || config.key;
    if(!key) {
	  key = fs.readFileSync(config.key_file);
     	if (config.key_file.search(".json$"))
          key = JSON.parse(key).private_key;
    }

    // Load email
    email = email || process.env.ANALYTICS_REPORT_EMAIL;

    // Load Reports
    reports_path = reports_path || process.env.ANALYTICS_REPORTS_PATH;
    var reports = JSON.parse(fs.readFileSync(reports_path)).reports;
    var by_name = {};
    for (var i=0; i< reports.length; i++)
        by_name[reports[i].name] = reports[i];
    this.reports = by_name;

    // Set the query ID
    this.account_ids = account_ids || config.account.ids;

    // Set the debug flag
    this.debug = debug;

    // Init the report api func
    this.api = new GoogleAnalyticsApi(key, email);

}

 /* the query prototype method injests a report and prepares a query
 object used to fetch data from the api */
Analytics.prototype.query = function (report, callback) {

  if (!report)
    return callback("Report not defined", null);

  var query = {};
  query.ids = this.account_ids;

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

  this.api.fetchData(query, report, callback);

};

// Given reports name or frequncy choose the reports that will be run
Analytics.prototype.select_reports = function(report_names, frequency) {
  var reports_to_run;
  if (report_names)
    reports_to_run = report_names.split(",");
  else if (frequency) {
    reports_to_run = [];
    var all_reports = Object.keys(this.reports);
    for (var i=0; i<all_reports.length; i++) {
      if (this.reports[all_reports[i]].frequency == frequency)
        reports_to_run.push(all_reports[i]);
    }
  }
  else
    reports_to_run = Object.keys(this.reports);

  return reports_to_run;

};

// Allows reports to be published
Analytics.prototype.publish =  function(name, data, extension, callback) {

    if (this.debug) console.log("[" + name + "] Publishing to " + config.aws.bucket + "...");

    var mime = {".json": "application/json", ".csv": "text/csv"};

    zlib.gzip(data, function(err, compressed) {

      if (err) return console.log("ERROR AFTER GZIP: " + err);

      new AWS.S3({params: {Bucket: config.aws.bucket}}).upload({
        Key: config.aws.path + "/" + name + extension,
        Body: compressed,
        ContentType: mime[extension],
        ContentEncoding: "gzip",
        ACL: "public-read",
        CacheControl: "max-age=" + (config.aws.cache || 0)
      }, callback);

    });
  };

//slim, csv, json, frequncy, report_names, output
Analytics.prototype.run = function(options) {
  // Avoid `this` bug by setting this to self
  var self = this;
  // Function for running each report
  var eachReport = function(report_name, done) {
    // Select report
    var report = self.reports[report_name];
    // Return if no report
    if (!report) return done('Report not defined.');
    // Debug option
    if (self.debug) console.log("\n[" + report.name + "] Fetching...");
    // Define the callback after making query
    self.query(report, function(err, data) {
	  // Check for failure
        if (err) return console.log("ERROR AFTER QUERYING: " + err);
    	   // Debug option
        if (self.debug) console.log("[" + report.name + "] Saving report data...");

	   // Function for exporting json
  	 var exportJSON = function () {
          // some reports can be slimmed down for direct rendering
          if (options.slim && report.slim) delete data.data;
          writeReport(report_name, JSON.stringify(data, null, 2), ".json", done);
        };

        // CSV, see https://github.com/C2FO/fast-csv#formatting-functions
        if (options.csv) {
          csv.writeToString(data.data, {headers: true}, function(err, data) {
            if (err) return console.log("ERROR AFTER CSV: " + JSON.stringify(err));
            writeReport(report_name, data, ".csv", function() {
              // Check if JSON report should be exported along with CSV
              if (options.json) exportJSON();
              else done();
            });
          });
        }
        else
          exportJSON();
    });
  };

  // Define the function for writing reports
  var writeReport = function(name, data, extension, done) {
    // Callback method to inform async loop, report writing is finished
    var written = function(err) {
      if (err) console.error("ERROR AFTER WRITING: " + JSON.stringify(err));
      else if (self.debug) console.log("[" + name + "] Done.");
      done();
    };
    // Select the type of export and export
    if (options.publish)
      self.publish(name, data, extension, written);
    else if (options.output && (typeof(options.output) == "string"))
      fs.writeFile(path.join(options.output, (name + extension)), data, written);
    else {
      // allows users to pretty reliably split on \n\n
      console.log(data + "\n");
      written();
    }
  };
   // Start async loop
   var reports_to_run = self.select_reports(options.only, options.frequency);
   async.eachSeries(reports_to_run, eachReport, function(err) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if (this.debug) console.log("All done.");
  });

};

module.exports = Analytics;
