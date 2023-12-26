const { ANALYTICS_DATA_TABLE_NAME } = require("../../src/publish/postgres")

const knex = require("knex")

const connection = {
  host: process.env.POSTGRES_HOST ? process.env.POSTGRES_HOST : "localhost",
  database: "analytics_reporter_test",
  user : process.env.POSTGRES_USER ? process.env.POSTGRES_HOST : 'postgres',
  password : process.env.POSTGRES_PASSWORD ? process.env.POSTGRES_PASSWORD : ''
}

const resetSchema = (db) => {
  return db("analytics_data_ga4").delete()
}

module.exports = { connection, resetSchema }
