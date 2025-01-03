/**
 * Handles providing a database client for the Pg-Boss library using knex.
 */
class PgBossKnexAdapter {
  #knex;

  /**
   * @param {import('knex')} knexInstance an initialized instance of the knex
   * library which provides a database connection.
   */
  constructor(knexInstance) {
    this.#knex = knexInstance;
  }

  /**
   * Execute PgBoss SQL using the knex library interface
   *
   * @param {string} sql the SQL string to execute.
   * @param {string[]} parameters the parameters to insert into the SQL string.
   * @returns {Promise} which resolves with the result of the SQL query.
   */
  executeSql(sql, parameters = []) {
    // This is needed to replace pg-boss' $1, $2 arguments
    // into knex's :val, :val2 style.
    const replacedSql = sql.replace(
      /\$(\d+)\b/g,
      (_, number) => `:param_${number}`,
    );

    const parametersObject = {};
    parameters.forEach(
      (value, index) => (parametersObject[`param_${index + 1}`] = value),
    );

    return this.#knex.raw(replacedSql, parametersObject);
  }
}

module.exports = PgBossKnexAdapter;
