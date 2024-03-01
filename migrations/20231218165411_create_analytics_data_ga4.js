exports.up = function (knex) {
  return knex.schema.createTable("analytics_data_ga4", (table) => {
    table.increments("id");
    table.string("report_name");
    table.string("report_agency");
    table.dateTime("date");
    table.jsonb("data");
    table.timestamps(true, true);
    table.string("version");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("analytics_data_ga4");
};
