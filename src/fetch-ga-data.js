const google = require("googleapis")

const fetchGoogleAnalyticsData = (query, { realtime } = {}) => {
  return new Promise((resolve, reject) => {
    get(realtime)(query, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

const get = (realtime) => {
  const analytics = google.analytics("v3")
  if (realtime) {
    return analytics.data.realtime.get
  } else {
    return analytics.data.ga.get
  }
}

module.exports = fetchGoogleAnalyticsData
