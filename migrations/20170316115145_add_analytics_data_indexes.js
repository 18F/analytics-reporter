exports.up = function(knex) {
  return knex.schema.table("analytics_data", table => {
    table.index(["report_name", "report_agency"])
  }).then(() => {
    return knex.schema.raw("CREATE INDEX analytics_data_date_time_desc ON analytics_data (date_time DESC NULLS LAST)")
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.table("analytics_data", table => {
    table.dropIndex(["report_name", "report_agency"])
    table.dropIndex("date_time", "analytics_data_date_time_desc")
  })
};
