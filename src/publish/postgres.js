const ANALYTICS_DATA_TABLE_NAME = "analytics_data"

const knex = require("knex")
const Promise = require("bluebird")
const config = require("../config")

const publish = (results) => {
  if (results.query.dimensions.match(/ga:date/)) {
    const db = knex({ client: "pg", connection: config.postgres })
    return _writeRegularResults({ db, results }).then(() => db.destroy())
  } else {
    return Promise.resolve()
  }
}

const _convertDataAttributesToNumbers = (data) => {
  const transformedData = Object.assign({}, data)

  const numbericalAttributes = ["visits", "total_events", "users"]
  numbericalAttributes.forEach(attributeName => {
    if (transformedData[attributeName]) {
      transformedData[attributeName] = Number(transformedData[attributeName])
    }
  })

  return transformedData
}

const _dataForDataPoint = (dataPoint) => {
  const data = _convertDataAttributesToNumbers(dataPoint)

  const date = _dateTimeForDataPoint(dataPoint)

  delete data.date
  delete data.hour

  return {
    date,
    data,
  }
}

const _dateTimeForDataPoint = (dataPoint) => {
  if (!isNaN(Date.parse(dataPoint.date))) {
    return dataPoint.date
  }
}

const _queryForExistingRow = ({ db, row }) => {
  query = db(ANALYTICS_DATA_TABLE_NAME)

  Object.keys(row).forEach(key => {
    if (row[key] === undefined) {
      return
    } else if (key === "data") {
      const dataQuery = Object.assign({}, row.data)
      delete dataQuery.visits
      delete dataQuery.users
      delete dataQuery.total_events
      Object.keys(dataQuery).forEach(dataKey => {
        query = query.whereRaw(`data->>'${dataKey}' = ?`, [dataQuery[dataKey]])
      })
    } else {
      query = query.where({ [key]: row[key] })
    }
  })

  return query.select()
}

const _handleExistingRow = ({ db, existingRow, newRow }) => {
  if (existingRow.data.visits != newRow.data.visits ||
      existingRow.data.users != newRow.data.users ||
      existingRow.data.total_events != newRow.data.total_events
  ) {
    return db(ANALYTICS_DATA_TABLE_NAME).where({ id: existingRow.id }).update(newRow)
  }
}

const _rowForDataPoint = ({ results, dataPoint }) => {
  const row = _dataForDataPoint(dataPoint)
  row.report_name = results.name
  row.report_agency = results.agency
  return row
}

const _writeRegularResults = ({ db, results }) => {
  const rows = results.data.map(dataPoint => {
    return _rowForDataPoint({ results, dataPoint })
  })

  const rowsToInsert = []
  return Promise.each(rows, row => {
    return _queryForExistingRow({ db, row }).then(results => {
      if (row.date === undefined) {
        return
      } else if (results.length === 0) {
        rowsToInsert.push(row)
      } else if (results.length === 1) {
        return _handleExistingRow({ db, existingRow: results[0], newRow: row })
      }
    })
  }).then(() => {
    return db(ANALYTICS_DATA_TABLE_NAME).insert(rowsToInsert)
  }).then(() => {
    return db.destroy()
  })
}

module.exports = { publish, ANALYTICS_DATA_TABLE_NAME }
