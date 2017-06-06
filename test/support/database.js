const { ANALYTICS_DATA_TABLE_NAME } = require("../../src/publish/postgres")

const knex = require("knex")

const connection = {
  host: process.env.PG_HOST ? process.env.PG_HOST : "localhost",
  database: process.env.CIRCLECI ? "circle_test" : "analytics_reporter_test",
  user : process.env.PG_USER ? process.env.PG_USER : 'postgres'
}

const resetSchema = () => {
  const db = knex({ client: "pg", connection })
  return db.schema.dropTableIfExists(ANALYTICS_DATA_TABLE_NAME).then(() => {
    return db.schema.createTable(ANALYTICS_DATA_TABLE_NAME, (table) => {
      table.increments("id")
      table.string("report_name")
      table.string("report_agency")
      table.date("date")
      table.jsonb("data")
      table.timestamps(true, true)
    })
  })
}

module.exports = { connection, resetSchema }
