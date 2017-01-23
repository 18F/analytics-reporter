const cfenv = require("cfenv")
const appEnv = cfenv.getAppEnv()
const newRelicEnv = appEnv.getServiceCreds("analytics-reporter-new-relic")

exports.config = {
  app_name: [newRelicEnv.APP_NAME],
  license_key: newRelicEnv.LICENSE_KEY,
  logging: {
    level: "info"
  }
}
