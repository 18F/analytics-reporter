module.exports = {
  development: {
    client: "postgresql",
    connection: {
      database: process.env.POSTGRES_DATABASE || "analytics-reporter",
      host: process.env.POSTGRES_HOST || "localhost",
      user: process.env.POSTGRES_USER || "analytics",
      password: process.env.POSTGRES_PASSWORD || "123abc",
      port: 5432,
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  test: {
    client: "postgresql",
    connection: {
      database: process.env.POSTGRES_DATABASE || "analytics_reporter_test",
      host: process.env.POSTGRES_HOST || "localhost",
      user: process.env.POSTGRES_USER || "analytics",
      password: process.env.POSTGRES_PASSWORD || "123abc",
      port: 5432,
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
    },
  },
  production: {
    client: "postgresql",
    connection: {
      database: process.env.POSTGRES_DATABASE,
      host: process.env.POSTGRES_HOST,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: true,
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
