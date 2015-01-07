// Set environment variables to configure the application.

module.exports = {

  email: process.env.ANALYTICS_REPORT_EMAIL,
  key: process.env.ANALYTICS_KEY_PATH,

  debug: (process.env.ANALYTICS_DEBUG ? true : false),

  // No trailing slashes
  aws: {
    bucket: process.env.AWS_BUCKET,
    path: process.env.AWS_BUCKET_PATH,
    // in seconds. Defaults to an hour (3600)
    cache: process.env.AWS_CACHE_TIME
  },

  account: {
    ids: process.env.ANALYTICS_REPORT_IDS
  },

  mongo: {
    host: process.env.MONGO_HOST,
    database: process.env.MONGO_DATABASE
  }

};
