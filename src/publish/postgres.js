const knex = require("knex");

Promise.each = async function (arr, fn) {
  for (const item of arr) await fn(item);
};

class PostgresPublisher {
  static ANALYTICS_DATA_TABLE_NAME = "analytics_data_ga4";
  #connectionConfig;

  constructor(config) {
    this.#connectionConfig = config.postgres;
  }

  async publish(results) {
    if (results.query.dimensions.some((obj) => obj.name === "date")) {
      const db = await knex({
        client: "pg",
        connection: this.#connectionConfig,
      });
      await this.#writeRegularResults({ db, results });
      await db.destroy();
    } else {
      return;
    }
  }

  #writeRegularResults({ db, results }) {
    const rows = results.data.map((dataPoint) => {
      return this.#rowForDataPoint({ results, dataPoint });
    });

    const rowsToInsert = [];
    return Promise.each(rows, async (row) => {
      const existingRow = await this.#queryForExistingRow({ db, row });
      if (row.date === undefined) {
        return;
      } else if (existingRow.length === 0) {
        rowsToInsert.push(row);
      } else if (existingRow.length === 1) {
        await this.#handleExistingRow({
          db,
          existingRow: existingRow[0],
          newRow: row,
        });
      }
    })
      .then(() => {
        if (rowsToInsert.length > 0) {
          return db(this.constructor.ANALYTICS_DATA_TABLE_NAME).insert(
            rowsToInsert,
          );
        }
      })
      .then(() => {
        return db.destroy();
      });
  }

  #rowForDataPoint({ results, dataPoint }) {
    const row = this.#dataForDataPoint(dataPoint);
    row.report_name = results.name;
    row.report_agency = results.agency;
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
    const transformedData = Object.assign({}, data);

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

  #queryForExistingRow({ db, row }) {
    let query = db(this.constructor.ANALYTICS_DATA_TABLE_NAME);

    Object.keys(row).forEach((key) => {
      if (row[key] === undefined) {
        return;
      } else if (key === "data") {
        const dataQuery = Object.assign({}, row.data);
        delete dataQuery.visits;
        delete dataQuery.users;
        delete dataQuery.total_events;
        Object.keys(dataQuery).forEach((dataKey) => {
          query = query.whereRaw(`data->>'${dataKey}' = ?`, [
            dataQuery[dataKey],
          ]);
        });
      } else {
        query = query.where({ [key]: row[key] });
      }
    });

    return query.select();
  }

  #handleExistingRow({ db, existingRow, newRow }) {
    if (
      existingRow.data.visits != newRow.data.visits ||
      existingRow.data.users != newRow.data.users ||
      existingRow.data.total_events != newRow.data.total_events
    ) {
      return db(this.constructor.ANALYTICS_DATA_TABLE_NAME)
        .where({ id: existingRow.id })
        .update(newRow);
    }
  }
}

module.exports = PostgresPublisher;
