const VCAP_SERVICES_JSON = JSON.parse(process.env.VCAP_SERVICES);

module.exports = {
  production: {
    client: "postgresql",
    connection: {
      host: VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["host"],
      user: VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["username"],
      password: VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["password"],
      database: VCAP_SERVICES_JSON["aws-rds"][0]["credentials"]["db_name"],
      port: 5432,
      ssl: true,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
};
