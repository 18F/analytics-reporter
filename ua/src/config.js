const knexfile = require("../../knexfile");

// Set environment variables to configure the application.
module.exports = {
  agency: process.env.AGENCY_NAME || "gov-wide",
  email: process.env.ANALYTICS_REPORT_EMAIL,
  key: process.env.ANALYTICS_KEY,
  logLevel: process.env.ANALYTICS_LOG_LEVEL,
  scriptName: process.env.ANALYTICS_SCRIPT_NAME,
  analytics_credentials: process.env.ANALYTICS_CREDENTIALS,
  ua_reports_file: process.env.ANALYTICS_UA_REPORTS_PATH,
  debug: process.env.ANALYTICS_DEBUG ? true : false,
  account: {
    ids: process.env.ANALYTICS_REPORT_UA_IDS,
    agency_name: process.env.AGENCY_NAME,
    // needed for realtime reports which don't include hostname
    // leave blank if your view includes hostnames
    hostname: process.env.ANALYTICS_HOSTNAME || "",
  },
  postgres: knexfile[process.env.NODE_ENV || "development"].connection,
  static: {
    path: "../analytics.usa.gov/",
  },
};
