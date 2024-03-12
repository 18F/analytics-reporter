const PostgresPublisher = require("../../src/publish/postgres");

const Config = require("../../src/config");

const resetSchema = (db) => {
  return db(PostgresPublisher.ANALYTICS_DATA_TABLE_NAME).delete();
};

module.exports = { connection: new Config().postgres, resetSchema };
