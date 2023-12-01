const config = require("./src/config")

const VCAP_SERVICES_JSON = JSON.parse(process.env.VCAP_SERVICES);

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
      host : VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["host"],
      user : VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["username"],
      password : VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["password"],
      database : VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["db_name"],
      port: 5432,
      ssl : true
    }
  },
}
