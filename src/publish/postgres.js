Promise.each = async function (arr, fn) {
  for (const item of arr) await fn(item);
};

/**
 * Handles read/write operations to the Postgres database for analytics reports.
 */
class PostgresPublisher {
  static ANALYTICS_DATA_TABLE_NAME = "analytics_data_ga4";
  #knex;

  /**
   * @param {import('knex')} knexInstance an initialized instance of the knex
   * library which provides a database connection.
   */
  constructor(knexInstance) {
    this.#knex = knexInstance;
  }

  /**
   * @param {object} results the processed results of analytics report data.
   * @param {object[]} results.data an array of data points to write to the
   * Postgres database.
   * @returns {Promise} resolves when the database operations complete. Rejects
   * if database operations have an error.
   */
  async publish(results) {
    if (results.query.dimensions.some((obj) => obj.name === "date")) {
      await this.#writeRegularResults({ results });
    } else {
      return;
    }
  }

  #writeRegularResults({ results }) {
    const rows = results.data.map((dataPoint) => {
      return this.#rowForDataPoint({ results, dataPoint });
    });

    const rowsToInsert = [];
    return Promise.each(rows, async (row) => {
      const existingRow = await this.#queryForExistingRow({ row });
      if (row.date === undefined) {
        return;
      } else if (existingRow.length === 0) {
        rowsToInsert.push(row);
      } else if (existingRow.length === 1) {
        await this.#handleExistingRow({
          existingRow: existingRow[0],
          newRow: row,
        });
      }
    }).then(() => {
      if (rowsToInsert.length > 0) {
        return this.#knex(this.constructor.ANALYTICS_DATA_TABLE_NAME).insert(
          rowsToInsert,
        );
      }
    });
  }

  #rowForDataPoint({ results, dataPoint }) {
    const row = this.#dataForDataPoint(dataPoint);
    row.report_name = results.name;
    row.report_agency = results.agency ? results.agency : null;
    return row;
  }

  #dataForDataPoint(dataPoint) {
    const data = this.#convertDataAttributesToNumbers(dataPoint);
    const date = this.#dateTimeForDataPoint(dataPoint);

    delete data.date;
    delete data.hour;

    return {
      date,
      data,
    };
  }

  #convertDataAttributesToNumbers(data) {
    const transformedData = { ...data };

    const numbericalAttributes = ["visits", "total_events", "users"];
    numbericalAttributes.forEach((attributeName) => {
      if (transformedData[attributeName]) {
        transformedData[attributeName] = Number(transformedData[attributeName]);
      }
    });

    return transformedData;
  }

  #dateTimeForDataPoint(dataPoint) {
    if (!isNaN(Date.parse(dataPoint.date))) {
      return dataPoint.date;
    }
  }

  #queryForExistingRow({ row }) {
    let query = this.#knex(this.constructor.ANALYTICS_DATA_TABLE_NAME);

    Object.keys(row).forEach((key) => {
      if (row[key] === undefined) {
        return;
      } else if (key === "data") {
        const dataQuery = Object.assign({}, row.data);
        delete dataQuery.visits;
        delete dataQuery.users;
        delete dataQuery.total_events;
        Object.keys(dataQuery).forEach((dataKey) => {
          // Replace single quotes with double single quotes to avoid SQL syntax
          // problems when searching for strings with single quotes.
          // Replace ? with \\? to avoid knex trying to substitute the question
          // mark with a value.
          query = query.whereRaw(
            `data @> '${JSON.stringify({ [dataKey]: dataQuery[dataKey] })
              .replaceAll("'", "''")
              .replaceAll("?", "\\?")}'::jsonb`,
          );
        });
      } else {
        query = query.where({ [key]: row[key] });
      }
    });

    return query.select();
  }

  #handleExistingRow({ existingRow, newRow }) {
    if (
      existingRow.data.visits != newRow.data.visits ||
      existingRow.data.users != newRow.data.users ||
      existingRow.data.total_events != newRow.data.total_events
    ) {
      return this.#knex(this.constructor.ANALYTICS_DATA_TABLE_NAME)
        .where({ id: existingRow.id })
        .update(newRow);
    }
  }
}

module.exports = PostgresPublisher;
