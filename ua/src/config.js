// Set environment variables to configure the application.
module.exports = {

  email: process.env.ANALYTICS_REPORT_EMAIL,
  key: process.env.ANALYTICS_KEY,
  analytics_credentials: process.env.ANALYTICS_CREDENTIALS,
  ua_reports_file: process.env.ANALYTICS_UA_REPORTS_PATH,

  debug: (process.env.ANALYTICS_DEBUG ? true : false),

  account: {
    ids: process.env.ANALYTICS_REPORT_UA_IDS,
    agency_name: process.env.AGENCY_NAME,
    // needed for realtime reports which don't include hostname
    // leave blank if your view includes hostnames
    hostname: process.env.ANALYTICS_HOSTNAME || "",
  },

  postgres: {
    host : process.env.POSTGRES_HOST,
    user : process.env.POSTGRES_USER,
    password : process.env.POSTGRES_PASSWORD,
    database : process.env.POSTGRES_DATABASE || "analytics-reporter",
    ssl: true,
  },

  static: {
    path: '../analytics.usa.gov/',
  },
};
