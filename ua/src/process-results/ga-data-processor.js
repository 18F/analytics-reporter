const config = require("../config")
const ResultTotalsCalculator = require("./result-totals-calculator")

const processData = (report, data) => {
  let result = _initializeResult({ report, data })

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

const _fieldNameForColumnIndex = ({ index, data }) => {
  const name = data.columnHeaders[index].name
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

const _initializeResult = ({ report, data }) => ({
  name: report.name,
  sampling: {
    containsSampledData: data.containsSampledData,
    sampleSize: data.sampleSize,
    sampleSpace: data.sampleSpace
  },
  query: ((query) => {
    query = Object.assign({}, query)
    delete query.ids
    return query
  })(data.query),
  meta: report.meta,
  data: [],
  totals: {},
  taken_at: new Date(),
})

const _processRow = ({ row, data, report }) => {
  const point = {}

  row.forEach((rowElement, index) => {
    const field = _fieldNameForColumnIndex({ index, data })
    let value = rowElement
    if (field === "date") {
      value = _formatDate(value)
    }
    point[field] = value
  })

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
  "ga:date": "date",
  "ga:hour": "hour",
  "rt:activeUsers": "active_visitors",
  "rt:pagePath": "page",
  "rt:pageTitle": "page_title",
  "ga:sessions": "visits",
  "ga:deviceCategory": "device",
  "ga:operatingSystem": "os",
  "ga:operatingSystemVersion": "os_version",
  "ga:hostname": "domain",
  "ga:browser" : 'browser',
  "ga:browserVersion" : "browser_version",
  "ga:source": "source",
  "ga:pagePath": "page",
  "ga:pageTitle": "page_title",
  "ga:pageviews": "visits",
  "ga:country": "country",
  "ga:city": 'city',
  "ga:eventLabel": "event_label",
  "ga:totalEvents": "total_events",
  "ga:landingPagePath": "landing_page",
  "ga:exitPagePath": "exit_page",
  "ga:source": "source",
  "ga:hasSocialSourceReferral": "has_social_referral",
  "ga:referralPath": "referral_path",
  "ga:pageviews": "pageviews",
  "ga:users": "users",
  "ga:pageviewsPerSession": "pageviews_per_session",
  "ga:avgSessionDuration": "avg_session_duration",
  "ga:exits": "exits",
  "ga:language": "language",
  "ga:screenResolution": "screen_resolution",
  "ga:mobileDeviceModel": "mobile_device",
  "rt:country": "country",
  "rt:city": "city",
  "rt:totalEvents": "total_events",
  "rt:eventLabel": "event_label"
}

module.exports = { processData }
