const config = require("../config")
const ResultTotalsCalculator = require("./result-totals-calculator")

const processData = (report, data, query) => {
  let result = _initializeResult({ report, data, query })

  // If you use a filter that results in no data, you get null
  // back from google and need to protect against it.
  if (!data || !data.rows) {
    return result;
  }

  // Some reports may decide to cut fields from the output.
  if (report.cut) {
    data = _removeColumnFromData({ column: report.cut, data })
  }

  // Remove data points that are below the threshold if one exists
  if (report.threshold) {
    data = _filterRowsBelowThreshold({ threshold: report.threshold, data })
  }

  // Process each row
  result.data = data.rows.map(row => {
    return _processRow({ row, report, data })
  })

  result.totals = ResultTotalsCalculator.calculateTotals(result)

  return result;
}

const _fieldNameForColumnIndex = ({ entryKey, index, data }) => {
  // data keys come back as values for the header keys
  const targetKey = entryKey.replace('Values', 'Headers')
  const name = data[targetKey][index].name
  return _mapping[name] || name
}

const _filterRowsBelowThreshold = ({ threshold, data }) => {
  data = Object.assign({}, data)

  const thresholdIndex = data.columnHeaders.findIndex(header => {
    return header.name === threshold.field
  })
  const thresholdValue = parseInt(threshold.value)

  data.rows = data.rows.filter(row => {
    return row[thresholdIndex] >= thresholdValue
  })

  return data
}

const _formatDate = (date) => {
    if (date == "(other)") {
      return date
    }
    return [date.substr(0,4), date.substr(4, 2), date.substr(6, 2)].join("-")
}

const _initializeResult = ({ report, data, query }) => ({
  name: report.name,
  sampling: data.metadata.samplingMetadatas,
  query: ((query) => {
    console.log({query})
    query = Object.assign({}, query)
    delete query.ids
    return query
  })(query),
  meta: report.meta,
  data: [],
  totals: {},
  taken_at: new Date(),
})

const _processRow = ({ row, data, report }) => {
  const point = {}

// Iterate through each entry in the object
for (const [entryKey, entryValue] of Object.entries(row)) {

  // Iterate through each object in the array
  entryValue.forEach((item, index) => {
    // Iterate through each key-value pair in the object
    for (const [key, value] of Object.entries(item)) {
      console.log(`${key}: ${value}`);
      if (key !== 'oneValue') {
        const field = _fieldNameForColumnIndex({ entryKey, index, data })

        let modValue;

        if (field === "date") {
          modValue = _formatDate(value)
        }

        modValue = value

        point[field] = modValue
      }
    }
  });
}

  if (config.account.hostname && !('domain' in point)) {
    point.domain = config.account.hostname
  }

  return point
}

const _removeColumnFromData = ({ column, data }) => {
  data = Object.assign(data)

  const columnIndex = data.columnHeaders.findIndex(header => {
    return header.name === column
  })

  data.columnHeaders.splice(columnIndex, 1)
  data.rows.forEach(row => {
    row.splice(columnIndex, 1)
  })

  return data
}

const _mapping = {
  "date": "date",
  "hour": "hour",
  "activeUsers": "active_visitors",
  "pagePathPlusQueryString": "page",
  "pageTitle": "page_title",
  "sessions": "visits",
  "deviceCategory": "device",
  "operatingSystem": "os",
  "operatingSystemVersion": "os_version",
  "hostName": "domain",
  "browser" : 'browser',
  // "browserVersion" : "browser_version",
  "sessionSource": "source",
  "screenPageViews": "visits",
  "country": "country",
  "city": 'city',
  "eventName": "event_label",
  "eventCount": "total_events",
  // "landingPagePath": "landing_page",
  // "exitPagePath": "exit_page",
  // "hasSocialSourceReferral": "has_social_referral",
  // "referralPath": "referral_path",
  // "pageviews": "pageviews",
  "totalUsers": "users",
  // "pageviewsPerSession": "pageviews_per_session",
  // "avgSessionDuration": "avg_session_duration",
  "exits": "exits",
  "language": "language",
  "screenResolution": "screen_resolution",
  "mobileDeviceModel": "mobile_device",
}

module.exports = { processData }
