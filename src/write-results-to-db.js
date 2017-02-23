const knex = require("knex")
const moment = require("moment-timezone")
const config = require("./config")

const writeResultsToDatabase = (results, { realtime } = {}) => {
  const db = knex({ client: "pg", connection: config.postgres })

  if (realtime) {
    return _writeRealtimeResults({ db, results }).then(() => db.destroy())
  } else if (results.query.dimensions.match(/ga:date/)) {
    return _writeRegularResults({ db, results }).then(() => db.destroy())
  } else {
    return Promise.resolve()
  }
}

const _dataForDataPoint = (dataPoint, { realtime } = {}) => {
  const data = Object.assign({}, dataPoint)
  let dateTime
  if (realtime) {
    dateTime = (new Date()).toISOString()
  } else {
    dateTime = _dateTimeForDataPoint(dataPoint)
  }
  delete data.date
  delete data.hour

  return {
    date_time: dateTime,
    data: data,
  }
}

const _dateTimeForDataPoint = (dataPoint) => {
  let dateString = dataPoint.date
  if (dataPoint.hour) {
    dateString = `${dateString}T${dataPoint.hour}:00:00`
  } else {
    dateString = `${dateString}T00:00:00`
  }
  if (!isNaN(Date.parse(dateString))) {
    return moment.tz(dateString, config.timezone).toISOString()
  }
}

const _rowForDataPoint = ({ results, dataPoint, realtime }) => {
  const row = _dataForDataPoint(dataPoint, { realtime })
  row.report_name = results.name
  row.report_agency = results.agency
  return row
}

const _rowWasAlreadyInserted = ({ db, row }) => {
  const query = Object.assign({}, row)
  Object.keys(query).forEach(key => {
    if (query[key] === undefined) {
      delete query[key]
    }
  })
  return db("analytics_data").where(query).count().then(result => {
    const count = parseInt(result[0].count)
    return count > 0
  })
}

const _writeRealtimeResults = ({ db, results }) => {
  const rows = results.data.map(dataPoint => {
    return _rowForDataPoint({ results, dataPoint, realtime: true })
  })
  return db("analytics_data").insert(rows)
}

const _writeRegularResults = ({ db, results }) => {
  const rows = results.data.map(dataPoint => {
    return _rowForDataPoint({ results, dataPoint })
  })

  const rowPromises = rows.map(row => {
    return _rowWasAlreadyInserted({ db, row }).then(inserted => {
      if (!inserted) {
        return row
      }
    })
  })

  return Promise.all(rowPromises).then(rows => {
    rows = rows.filter(row => {
      return row !== undefined && row.date_time !== undefined
    })
    return db("analytics_data").insert(rows)
  })
}

module.exports = writeResultsToDatabase
