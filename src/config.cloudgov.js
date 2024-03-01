const knexfile = require("../knexfile");
const VCAP_SERVICES_JSON = JSON.parse(process.env.VCAP_SERVICES);

// Set AWS env vars based on VCAP service values.
process.env["AWS_ACCESS_KEY_ID"] =
  VCAP_SERVICES_JSON["s3"][0]["credentials"]["access_key_id"];
process.env["AWS_SECRET_ACCESS_KEY"] =
  VCAP_SERVICES_JSON["s3"][0]["credentials"]["secret_access_key"];
process.env["AWS_REGION"] =
  VCAP_SERVICES_JSON["s3"][0]["credentials"]["region"];

// Set environment variables to configure the application.
module.exports = {
  email: process.env.ANALYTICS_REPORT_EMAIL,
  key: process.env.ANALYTICS_KEY,
  key_file:
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.ANALYTICS_KEY_PATH,
  analytics_credentials: process.env.ANALYTICS_CREDENTIALS,
  reports_file: process.env.ANALYTICS_REPORTS_PATH,
  debug: process.env.ANALYTICS_DEBUG ? true : false,
  // AWS S3 information.
  aws: {
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
  },
  account: {
    ids: process.env.ANALYTICS_REPORT_IDS,
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
