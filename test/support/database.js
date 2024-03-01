const { ANALYTICS_DATA_TABLE_NAME } = require("../../src/publish/postgres");

const config = require("../../src/config");

const resetSchema = (db) => {
  return db(ANALYTICS_DATA_TABLE_NAME).delete();
};

module.exports = { connection: config.postgres, resetSchema };
