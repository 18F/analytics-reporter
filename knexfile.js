const config = require("./src/config")

module.exports = {
  development: {
    client: 'postgresql',
    connection: config.postgres,
  },
  test: {
    client: 'postgresql',
    connection: {
      database: "analytics_reporter_test",
      user: process.env.CIRCLECI ? "postgres" : config.postgres.user
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
}
