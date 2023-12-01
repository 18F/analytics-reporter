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
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      port: 5432,
      ssl : true
    }
  },
}
