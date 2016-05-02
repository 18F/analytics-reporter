// Set environment variables to configure the application.

module.exports = {

  email: process.env.ANALYTICS_REPORT_EMAIL,
  key: process.env.ANALYTICS_KEY,
  key_file: process.env.ANALYTICS_KEY_PATH,

  reports_file: process.env.ANALYTICS_REPORTS_PATH,

  debug: (process.env.ANALYTICS_DEBUG ? true : false),

  db: {
    host: process.env.DB_HOST || "",
    port: process.env.DB_PORT || "",
    username:process.env.DB_USERNAME || "",
    password:process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "analytics-default",
    table: process.env.TABLE_NAME || "analytics-default",
    driver:process.env.DB_DRIVER || "mongodb",
  },

  /*
    AWS S3 information.

    Separately, you need to set AWS_REGION, AWS_ACCESS_KEY_ID, and
    AWS_SECRET_ACCESS_KEY. The AWS SDK for Node reads these in automatically.
  */
  aws: {
    // No trailing slashes
    bucket: process.env.AWS_BUCKET,
    path: process.env.AWS_BUCKET_PATH,
    // HTTP cache time in seconds. Defaults to 0.
    cache: process.env.AWS_CACHE_TIME
  },

  account: {
    ids: process.env.ANALYTICS_REPORT_IDS,
    // needed for realtime reports which don't include hostname
    // leave blank if your view includes hostnames
    hostname: process.env.ANALYTICS_HOSTNAME || ""
  },

  static: {
    path: '../analytics.usa.gov/'
  }

};
