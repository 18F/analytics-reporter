
exports.up = function(knex, Promise) {
  return knex.schema.raw("ALTER TABLE analytics_data RENAME COLUMN date_time TO date").then(() => {
   return knex.schema.raw("ALTER TABLE analytics_data ALTER COLUMN date TYPE date")
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.raw("ALTER TABLE analytics_data RENAME COLUMN date TO date_time").then(() => {
   return knex.schema.raw("ALTER TABLE analytics_data ALTER COLUMN date_time TYPE timestamp with time zone")
  })
};
