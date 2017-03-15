const expect = require("chai").expect
const proxyquire = require("proxyquire")
const googleAPIsMock = require("../support/mocks/googleapis-analytics")

proxyquire.noCallThru()

const googleapis = {}

const GoogleAnalyticsClient = proxyquire("../../src/google-analytics/client", {
  googleapis,
})

describe("GoogleAnalyticsClient", () => {
  describe(".fetchData(query, options)", () => {
    beforeEach(() => {
      Object.assign(googleapis, googleAPIsMock())
    })

    it("should call the google api with the query", done => {
      const query = {
        query: "that's me"
      }
      googleapis.ga.get = (query, cb) => {
        expect(query).to.deep.equal({
          query: "that's me"
        })
        done()
        cb(null, {})
      }
      GoogleAnalyticsClient.fetchData(query).catch(done)
    })

    it("should return a promise for Google Analytics data", done => {
      googleapis.ga.get = (query, cb) => {
        cb(null, { data: "that's me" })
      }
      GoogleAnalyticsClient.fetchData({}).then(data => {
        expect(data).to.deep.equal({ data: "that's me" })
        done()
      }).catch(done)
    })

    it("should reject if there is a problem fetching the data", done => {
      googleapis.ga.get = (query, cb) => {
        cb(new Error("I'm an error"))
      }
      GoogleAnalyticsClient.fetchData({}).catch(err => {
        expect(err.message).to.equal("I'm an error")
        done()
      }).catch(done)
    })

    it("should use the data get function if options.realtime is false", done => {
      googleapis.ga.get = () => {
        done()
      }
      GoogleAnalyticsClient.fetchData({}, { realtime: false }).catch(done)
    })
    it("should use the realtime get function if option.realtime is true", done => {
      googleapis.realtime.get = () => {
        done()
      }
      GoogleAnalyticsClient.fetchData({}, { realtime: true }).catch(done)
    })
  })
})
