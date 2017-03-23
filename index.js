var Analytics = require("./src/analytics"),
    config = require("./src/config"),
    fs = require("fs"),
    path = require('path'),
    async = require("async"),
    csv = require("fast-csv"),
    zlib = require('zlib');

const PostgresPublisher = require("./src/publish/postgres")
const ResultFormatter = require("./src/process-results/result-formatter")

// AWS credentials are looked for in env vars or in ~/.aws/config.
// AWS bucket and path need to be set in env vars mentioned in config.js.

var AWS = require("aws-sdk");

var publish = function(name, data, extension, options, callback) {
  if (options.debug) console.log("[" + name + "] Publishing to " + config.aws.bucket + "...");

  var mime = {".json": "application/json", ".csv": "text/csv"};
  //console.log(data);
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

var run = function(options) {
  if (!options) options = {};
  if (options.debug) options.verbose = options.debug;
  if (options.verbose) options.debug = options.verbose;

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

    if (!report) return done('Report not defined.');

    if (options.debug) console.log("\n[" + report.name + "] Fetching...");

    let format = "json"
    if (options.csv) {
      format = "csv"
    }

    return Analytics.query(report).then(data => {
      if (options.debug) {
        console.log("[" + report.name + "] Saving report data...")
      }

      if (config.account.agency_name) {
        data.agency = config.account.agency_name
      }

      if (options["write-to-database"]) {
        return Prostgres.publish(data, {
          realtime: report.realtime
        }).then(() => data)
      } else {
        return Promise.resolve(data)
      }
    }).then(data => {
      return ResultFormatter.formatResult(data, format, {
        slim: options.slim && report.slim
      })
    }).then(formattedResult => {
      return writeReport(name, formattedResult, `.${format}`, done)
    }).catch(err => {
      console.log("UNEXEPECTED ERROR: ", err)
      done(err)
    })
  };

  var writeReport = function(name, output, extension, done) {
    var written = function(err) {
      if (err)
        console.error("ERROR AFTER WRITING: " + JSON.stringify(err));
      else if (options.debug)
        console.log("[" + name + "] Done.");
      done();
    };

    if (options.publish)
      publish(name, output, extension, options, written);

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
      console.error(err);
      process.exit(1);
    }

    if (options.debug) console.log("All done.");
  });
};

module.exports = { run, publish };
