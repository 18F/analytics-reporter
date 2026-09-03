exports.config = {
  agent_enabled: !!process.env.NEW_RELIC_LICENSE_KEY,
  app_name: [process.env.NEW_RELIC_APP_NAME],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  proxy: `http://${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}@${process.env.PROXY_FQDN}:${process.env.PROXY_PORT}`,
  logging: {
    level: "info",
    filepath: "stdout",
  },
};
