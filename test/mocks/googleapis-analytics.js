const dataFixture = require("../fixtures/data")

const googleAPIsMock = () => {
  const data = Object.assign({}, dataFixture)
  const realtime = { get: (query, callback) => callback(null, data) }
  const ga = { get: (query, callback) => callback(null, data) }

  const analytics = (() => ({
    data: {
      realtime: realtime,
      ga: ga,
    }
  }))

  return { realtime, ga, analytics }
}

module.exports = googleAPIsMock
