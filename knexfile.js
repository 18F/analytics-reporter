const config = require("./src/config")

module.exports = {
  development: {
    client: 'postgresql',
    connection: config.postgres,
  },
  test: {
    client: 'postgresql',
    connection: {
      database: process.env.CIRCLECI ? "circle_test" : "analytics_reporter_test",
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
}
