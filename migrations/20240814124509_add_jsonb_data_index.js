/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.raw(
    "CREATE INDEX analytics_data_gin_jsonb ON analytics_data_ga4 USING gin(data jsonb_path_ops)",
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.table("analytics_data_ga4", (table) => {
    table.dropIndex("analytics_data_gin_jsonb");
  });
};
