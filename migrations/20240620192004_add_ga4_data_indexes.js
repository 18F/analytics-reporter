exports.up = function (knex) {
  return knex.schema
    .table("analytics_data_ga4", (table) => {
      table.index(["report_name", "report_agency"]);
    })
    .then(() => {
      return knex.schema.raw(
        "CREATE INDEX analytics_data_date_desc ON analytics_data_ga4 (date DESC NULLS LAST)",
      );
    })
    .then(() => {
      knex.schema.raw(
        "CREATE INDEX analytics_data_date_desc_id_asc ON analytics_data (date DESC NULLS LAST, id ASC)",
      );
    });
};

exports.down = function (knex) {
  return knex.schema.table("analytics_data_ga4", (table) => {
    table.dropIndex(["report_name", "report_agency"]);
    table.dropIndex("date", "analytics_data_date_desc");
    table.dropIndex("analytics_data_date_desc_id_asc");
  });
};
