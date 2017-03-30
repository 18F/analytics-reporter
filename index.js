var Analytics = require("./src/analytics"),
    config = require("./src/config"),
    fs = require("fs"),
    path = require('path'),
    async = require("async"),
    csv = require("fast-csv"),
    zlib = require('zlib');

const winston = require("winston-color")
const PostgresPublisher = require("./src/publish/postgres")
const ResultFormatter = require("./src/process-results/result-formatter")
const S3Publisher = require("./src/publish/s3")

var run = function(options) {
  if (!options) options = {};

  if (options.debug || options.verbose) {
    winston.level = "debug"
  }

  // can be overridden to only do one report
  var names;
  if (options.only)
    names = options.only.split(",");

  else if (options.frequency) {
    names = [];
    var all = Object.keys(Analytics.reports);
    for (var i=0; i<all.length; i++) {
      if (Analytics.reports[all[i]].frequency == options.frequency)
        names.push(all[i]);
    }
  }

  else
    names = Object.keys(Analytics.reports);

  var eachReport = function(name, done) {
    var report = Analytics.reports[name];
    var reportOptions = optionsForReport(report, options)

    if (!report) return done('Report not defined.');

    winston.debug("[" + report.name + "] Fetching...");

    return Analytics.query(report).then(data => {
      winston.debug("[" + report.name + "] Saving report data...")

      if (config.account.agency_name) {
        data.agency = config.account.agency_name
      }

      if (options["write-to-database"] && !report.realtime) {
        return PostgresPublisher.publish(data, reportOptions).then(() => data)
      } else {
        return Promise.resolve(data)
      }
    }).then(data => {
      return ResultFormatter.formatResult(data, reportOptions)
    }).then(formattedResult => {
      return writeReport(name, formattedResult, `.${reportOptions.format}`, done)
    }).catch(err => {
      winston.error("UNEXEPECTED ERROR:", err)
      done(err)
    })
  };

  var optionsForReport = (report, options) => ({
    format: options.csv ? "csv" : "json",
    slim: options.slim && report.slim,
    realtime: report.realtime,
  })

  var writeReport = function(name, output, extension, done) {
    var written = function(err) {
      if (err)
        winston.error("ERROR AFTER WRITING:", err);
      else if (options.debug)
        winston.debug("[" + name + "] Done.");
      done();
    };

    if (options.publish)
      S3Publisher.publish(output, { format: extension.slice(1) })

    else if (options.output && (typeof(options.output) == "string"))
      fs.writeFile(path.join(options.output, (name + extension)), output, written);

    else {
      // allows users to pretty reliably split on \n\n
      console.log(output + "\n");
      written();
    }
  };

  async.eachSeries(names, eachReport, function(err) {
    if (err) {
      winston.error(err);
      process.exit(1);
    }

    winston.debug("All done.");
  });
};

module.exports = { run };
