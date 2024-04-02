const path = require("path");
const knexfile = require("../knexfile");

// Application config
class Config {
  #options;

  /**
   * @param {Object} options an object with options to be used when processing
   * all reports.
   * @param {String} options.format the format of the analytics data produced.
   * Accepted formats are "csv" or "json"
   * @param {String} options.output a string filepath where the analytics data
   * will be written to disk after processing.
   * @param {Boolean} options.publish if true, the analytics data will be written
   * to AWS S3 after processing.
   * @param {Boolean} options.realtime if true, the application will use the
   * google analytics realtime data API when requesting data.
   * @param {Boolean} options.slim if true, the application will create a smaller
   * data object when formatting the processed data.
   * @param {Boolean} options['write-to-database'] if true, the application will
   * write the processed analytics data to the postgres database.
   * @param {String} options.only if set, runs only the report with name
   * matching the passed string.
   * @param {String} options.frequency if set, runs only the reports with
   * frequency matching the passed string.
   */
  constructor(options = {}) {
    this.#options = options;
  }

  get format() {
    return this.#options.csv ? "csv" : "json";
  }

  get output() {
    return this.#options.output;
  }

  get shouldPublishToDisk() {
    return !!this.#options.output && typeof this.#options.output === "string";
  }

  get shouldPublishToS3() {
    return !!this.#options.publish;
  }

  get shouldLogAnalyticsData() {
    return !(this.shouldPublishToDisk || this.shouldPublishToS3);
  }

  get shouldWriteToDatabase() {
    return !!this.#options["write-to-database"];
  }

  /**
   * @returns {Boolean} true if report configs with slim:true should have their
   * data removed from report results and only include totals.
   */
  get slim() {
    return !!this.#options.slim;
  }

  // The number of times to retry GA4 API calls. Defaults to 5
  get ga4CallRetryCount() {
    return Number.parseInt(process.env.ANALYTICS_GA4_CALL_RETRY_COUNT || 5);
  }

  // The number of milliseconds to delay before retrying a GA4 API call.
  // Defaults to 1000. (This is only the first retry delay, subsequent calls
  // will use exponential backoff.)
  get ga4CallRetryDelay() {
    return Number.parseInt(
      process.env.ANALYTICS_GA4_CALL_RETRY_DELAY_MS || 1000,
    );
  }

  get agency() {
    return process.env.AGENCY_NAME || "gov-wide";
  }

  get scriptName() {
    return process.env.ANALYTICS_SCRIPT_NAME;
  }

  get email() {
    return process.env.ANALYTICS_REPORT_EMAIL;
  }

  get logLevel() {
    return process.env.ANALYTICS_LOG_LEVEL || "debug";
  }

  // TODO: This doesn't seem to be used.
  get key() {
    return process.env.ANALYTICS_KEY;
  }

  get key_file() {
    return (
      process.env.GOOGLE_APPLICATION_CREDENTIALS ||
      process.env.ANALYTICS_KEY_PATH
    );
  }

  get analytics_credentials() {
    return process.env.ANALYTICS_CREDENTIALS;
  }

  // TODO: This seems to be unused
  get debug() {
    return !!process.env.ANALYTICS_DEBUG;
  }

  /*
    AWS S3 information.

    Separately, you need to set AWS_REGION, AWS_ACCESS_KEY_ID, and
    AWS_SECRET_ACCESS_KEY. The AWS SDK for Node reads these in automatically.
  */
  get aws() {
    if (this.#isCloudGov) {
      return this.#cloudGovAwsConfig;
    } else {
      return this.#envAwsConfig;
    }
  }

  get #isCloudGov() {
    return !!process.env.ANALYTICS_DEPLOYED_TO_CLOUD_GOV;
  }

  get #cloudGovAwsConfig() {
    const VCAP_SERVICES_JSON = JSON.parse(process.env.VCAP_SERVICES);

    return {
      bucket: VCAP_SERVICES_JSON["s3"][0]["credentials"]["bucket"],
      path: process.env.AWS_BUCKET_PATH,
      // HTTP cache time in seconds. Defaults to 0.
      cache: process.env.AWS_CACHE_TIME,
      endpoint: `https://${VCAP_SERVICES_JSON["s3"][0]["credentials"]["endpoint"]}`,
      accessKeyId: VCAP_SERVICES_JSON["s3"][0]["credentials"]["access_key_id"],
      secretAccessKey:
        VCAP_SERVICES_JSON["s3"][0]["credentials"]["secret_access_key"],
      region: VCAP_SERVICES_JSON["s3"][0]["credentials"]["region"],
      s3ForcePathStyle: process.env.AWS_S3_FORCE_STYLE_PATH,
      signatureVersion: process.env.AWS_SIGNATURE_VERSION,
    };
  }

  get #envAwsConfig() {
    return {
      bucket: process.env.AWS_BUCKET,
      path: process.env.AWS_BUCKET_PATH,
      // HTTP cache time in seconds. Defaults to 0.
      cache: process.env.AWS_CACHE_TIME,
      endpoint: process.env.AWS_S3_ENDPOINT,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      s3ForcePathStyle: process.env.AWS_S3_FORCE_STYLE_PATH,
      signatureVersion: process.env.AWS_SIGNATURE_VERSION,
    };
  }

  get account() {
    return {
      ids: process.env.ANALYTICS_REPORT_IDS,
      agency_name: process.env.AGENCY_NAME,
      // needed for realtime reports which don't include hostname
      // leave blank if your view includes hostnames
      hostname: process.env.ANALYTICS_HOSTNAME || "",
    };
  }

  get postgres() {
    return knexfile[process.env.NODE_ENV || "development"].connection;
  }

  get static() {
    return { path: "../analytics.usa.gov/" };
  }

  get reportConfigurations() {
    const reportFilePath = path.resolve(
      process.cwd(),
      process.env.ANALYTICS_REPORTS_PATH || "reports/usa.json",
    );
    return require(reportFilePath).reports;
  }

  get filteredReportConfigurations() {
    const reportConfigs = this.reportConfigurations;
    if (this.#options.only) {
      return reportConfigs.filter((reportConfig) => {
        return reportConfig.name === this.#options.only;
      });
    } else if (this.#options.frequency) {
      return reportConfigs.filter((reportConfig) => {
        return reportConfig.frequency === this.#options.frequency;
      });
    } else {
      return reportConfigs;
    }
  }
}

// Set environment variables to configure the application.
module.exports = Config;
