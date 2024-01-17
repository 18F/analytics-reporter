const { ANALYTICS_DATA_TABLE_NAME } = require("../../src/publish/postgres")

const knex = require("knex")

const connection = {
  host: process.env.PG_HOST ? process.env.PG_HOST : "localhost",
  database: "analytics_reporter_test",
  user : process.env.PG_USER ? process.env.PG_USER : 'postgres'
}

const resetSchema = (db) => {
  return db("analytics_data").delete()
}

module.exports = { connection, resetSchema }
