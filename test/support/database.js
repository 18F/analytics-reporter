const knex = require("knex")

const connection = {
  host: "localhost",
  database: process.env.TRAVIS ? "travis_ci_test" : "analytics_reporter_test",
}

const resetSchema = () => {
  const db = knex({ client: "pg", connection })
  return db.schema.dropTableIfExists("analytics_data").then(() => {
    return db.schema.createTable("analytics_data", (table) => {
      table.increments("id")
      table.string("report_name")
      table.string("report_agency")
      table.dateTime("date_time")
      table.jsonb("data")
      table.timestamps(true, true)
    })
  })
}

module.exports = { connection, resetSchema }
