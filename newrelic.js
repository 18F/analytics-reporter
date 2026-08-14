exports.config = {
  app_name: [process.env.NEW_RELIC_APP_NAME],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  proxy_host: process.env.PROXY_FQDN,
  proxy_port: process.env.PROXY_PORT,
  proxy_user: process.env.PROXY_USERNAME,
  proxy_pass: process.env.PROXY_PASSWORD,
  logging: {
    level: "info",
    filepath: "stdout",
  },
};
