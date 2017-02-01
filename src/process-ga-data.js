const _ = require('lodash')
const config = require("./config")

const processGoogleAnalyticsData = (report, data) => {
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

  if ((result.data.length > 0) && ("users" in result.data[0])) {
      result.totals.users = 0;
      for (var i=0; i<result.data.length; i++)
          result.totals.users += parseInt(result.data[i].users);
  }
  if ((result.data.length > 0) && ("visits" in result.data[0])) {
      result.totals.visits = 0;
      for (var i=0; i<result.data.length; i++)
          result.totals.visits += parseInt(result.data[i].visits);
  }

  if (_.startsWith(report.name, "device_model")) {
      result.totals.device_models = {};
      for (var i=0; i<result.data.length; i++) {
          if(typeof result.totals.device_models[result.data[i].mobile_device] == "undefined") {
              result.totals.device_models[result.data[i].mobile_device] = parseInt(result.data[i].visits);
          } else {
              result.totals.device_models[result.data[i].mobile_device] += parseInt(result.data[i].visits);
          }
      }
  }

  if (_.startsWith(report.name, "language")) {
      result.totals.languages = {};
      for (var i=0; i<result.data.length; i++) {
          if(typeof result.totals.languages[result.data[i].language] == "undefined") {
              result.totals.languages[result.data[i].language] = parseInt(result.data[i].visits);
          } else {
              result.totals.languages[result.data[i].language] += parseInt(result.data[i].visits);
          }
      }
  }


  if (_.startsWith(report.name, "devices")) {
      result.totals.devices = {mobile: 0, desktop: 0, tablet: 0};
      for (var i=0; i<result.data.length; i++)
          result.totals.devices[result.data[i].device] += parseInt(result.data[i].visits);
  }

  if (report.name == "screen-size") {
      result.totals.screen_resolution = {};

      for (var i=0; i<result.data.length; i++) {
          var screen_resolution = result.data[i].screen_resolution;
          var visits = parseInt(result.data[i].visits);

          if (!result.totals.screen_resolution[screen_resolution]) result.totals.screen_resolution[screen_resolution] = 0;
          result.totals.screen_resolution[screen_resolution] += visits;
      }
  }

  if (report.name == "os") {

      result.totals.os = {};

      for (var i=0; i<result.data.length; i++) {
          var os = result.data[i].os;
          var visits = parseInt(result.data[i].visits);

          if (!result.totals.os[os]) result.totals.os[os] = 0;
          result.totals.os[os] += visits;
      }
  }

  if (report.name == "windows") {
      result.totals.os_version = {};

      for (var i=0; i<result.data.length; i++) {
          var version = result.data[i].os_version;
          var visits = parseInt(result.data[i].visits);

          if (!result.totals.os_version[version]) result.totals.os_version[version] = 0;
          result.totals.os_version[version] += visits;
      }
  }

  if (report.name == "browsers") {
      result.totals.browser = {};

      for (var i=0; i<result.data.length; i++) {
          var browser = result.data[i].browser;
          var visits = parseInt(result.data[i].visits);

          if (!result.totals.browser[browser]) result.totals.browser[browser] = 0;
          result.totals.browser[browser] += visits;
      }
  }

  if (report.name == "ie") {
      result.totals.ie_version = {};

      for (var i=0; i<result.data.length; i++) {
          var version = result.data[i].browser_version;
          var visits = parseInt(result.data[i].visits);

          if (!result.totals.ie_version[version]) result.totals.ie_version[version] = 0;
          result.totals.ie_version[version] += parseInt(result.data[i].visits);
      }
  }

  if (report.name == "os-browsers") {

      // Two two-level hashes.
      result.totals.by_os = {};
      result.totals.by_browsers = {};

      for (var i=0; i<result.data.length; i++) {
          var os = result.data[i].os;
          var browser = result.data[i].browser;
          var visits = parseInt(result.data[i].visits)

          if (!result.totals.by_os[os]) result.totals.by_os[os] = {};
          if (!result.totals.by_os[os][browser]) result.totals.by_os[os][browser] = 0;

          if (!result.totals.by_browsers[browser]) result.totals.by_browsers[browser] = {};
          if (!result.totals.by_browsers[browser][os]) result.totals.by_browsers[browser][os] = 0;

          result.totals.by_os[os][browser] += visits;
          result.totals.by_browsers[browser][os] += visits;
      }
  }

  if (report.name == "windows-ie") {

      // Two two-level hashes.
      result.totals.by_windows = {};
      result.totals.by_ie = {};

      for (var i=0; i<result.data.length; i++) {
          var windows = result.data[i].os_version;
          var ie = result.data[i].browser_version;
          var visits = parseInt(result.data[i].visits)

          if (!result.totals.by_windows[windows]) result.totals.by_windows[windows] = {};
          if (!result.totals.by_windows[windows][ie]) result.totals.by_windows[windows][ie] = 0;

          if (!result.totals.by_ie[ie]) result.totals.by_ie[ie] = {};
          if (!result.totals.by_ie[ie][windows]) result.totals.by_ie[ie][windows] = 0;

          result.totals.by_windows[windows][ie] += visits;
          result.totals.by_ie[ie][windows] += visits;
      }
  }

  if (report.name == "windows-browsers") {

      result.totals.by_windows = {};
      result.totals.by_browsers = {};

      for (var i=0; i<result.data.length; i++) {
          var version = result.data[i].os_version;
          var browser = result.data[i].browser;
          var visits = parseInt(result.data[i].visits)

          if (!result.totals.by_windows[version]) result.totals.by_windows[version] = {};
          if (!result.totals.by_windows[version][browser]) result.totals.by_windows[version][browser] = 0;

          if (!result.totals.by_browsers[browser]) result.totals.by_browsers[browser] = {};
          if (!result.totals.by_browsers[browser][version]) result.totals.by_browsers[browser][version] = 0;

          result.totals.by_windows[version][browser] += visits;
          result.totals.by_browsers[browser][version] += visits;
      }
  }

  // presumably we're organizing these by date
  if ((result.data.length > 0) && (result.data[0].date)) {

      // At least one report (screen-size) gives back a bogus
      // first entry, for unknown reasons.
      if (result.data[0].date == "(other)")
          result.totals.start_date = result.data[1].date;
      else
          result.totals.start_date = result.data[0].date;

      result.totals.end_date = result.data[result.data.length-1].date;
  }

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

  if (config.account.hostname) {
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

module.exports = processGoogleAnalyticsData
