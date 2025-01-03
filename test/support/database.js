const PostgresPublisher = require("../../src/publish/postgres");

const AppConfig = require("../../src/app_config");

const resetSchema = (db) => {
  return db(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME).delete();
};

module.exports = {
  connection: new AppConfig().knexConfig.connection,
  resetSchema,
};
