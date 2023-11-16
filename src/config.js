// Set environment variables to configure the application.

const VCAP_SERVICES_JSON = JSON.parse(process.env.VCAP_SERVICES);
console.log(VCAP_SERVICES_JSON)

module.exports = {

  email: process.env.ANALYTICS_REPORT_EMAIL,
  key: process.env.ANALYTICS_KEY,
  key_file: process.env.ANALYTICS_KEY_PATH,
  analytics_credentials: process.env.ANALYTICS_CREDENTIALS,

  reports_file: process.env.ANALYTICS_REPORTS_PATH,

  debug: (process.env.ANALYTICS_DEBUG ? true : false),

  /*
    AWS S3 information.

    Separately, you need to set AWS_REGION, AWS_ACCESS_KEY_ID, and
    AWS_SECRET_ACCESS_KEY. The AWS SDK for Node reads these in automatically.
  */
  // aws: {
    // No trailing slashes
    // bucket: process.env.AWS_BUCKET,
    // path: process.env.AWS_BUCKET_PATH,
    // HTTP cache time in seconds. Defaults to 0.
    // cache: process.env.AWS_CACHE_TIME,
    // endpoint: process.env.AWS_S3_ENDPOINT,
    // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    // s3ForcePathStyle: process.env.AWS_S3_FORCE_STYLE_PATH,
    // signatureVersion: process.env.AWS_SIGNATURE_VERSION
  // },
  //
  aws: {
    // No trailing slashes
    bucket:  VCAP_SERVICES_JSON.s3.credentials.bucket,
    path: process.env.AWS_BUCKET_PATH,
    // HTTP cache time in seconds. Defaults to 0.
    cache: process.env.AWS_CACHE_TIME,
    endpoint: VCAP_SERVICES_JSON.s3.credentials.endpoint,
    accessKeyId: VCAP_SERVICES_JSON.s3.credentials.access_key_id,
    secretAccessKey: VCAP_SERVICES_JSON.s3.credentials.secret_access_key,
    s3ForcePathStyle: process.env.AWS_S3_FORCE_STYLE_PATH,
    signatureVersion: process.env.AWS_SIGNATURE_VERSION
  },


  account: {
    ids: process.env.ANALYTICS_REPORT_IDS,
    agency_name: process.env.AGENCY_NAME,
    // needed for realtime reports which don't include hostname
    // leave blank if your view includes hostnames
    hostname: process.env.ANALYTICS_HOSTNAME || "",
  },

  // postgres: {
  //   host : process.env.POSTGRES_HOST,
  //   user : process.env.POSTGRES_USER,
  //   password : process.env.POSTGRES_PASSWORD,
  //   database : process.env.POSTGRES_DATABASE || "analytics-reporter",
  // },

  postgres: {
    host : VCAP_SERVICES_JSON.aws-rds[0].credentials.host,
    user : VCAP_SERVICES_JSON.aws-rds[0].credentials.username,
    password : VCAP_SERVICES_JSON.aws-rds[0].credentials.password,
    database : VCAP_SERVICES_JSON.aws-rds[0].credentials.db_name,
 },

  static: {
    path: '../analytics.usa.gov/',
  },
};
