const expect = require("chai").expect
const proxyquire = require("proxyquire")

describe("Analytics", () => {
  let Analytics
  let GoogleAnalyticsClient
  let GoogleAnalyticsDataProcessor

  beforeEach(() => {
    GoogleAnalyticsClient = {}
    GoogleAnalyticsDataProcessor = {}

    Analytics = proxyquire("../src/analytics", {
      "./google-analytics/client": GoogleAnalyticsClient,
      "./process-results/ga-data-processor": GoogleAnalyticsDataProcessor,
    })
  })
  describe(".query(report)", () => {
    it("should resolve with formatted google analytics data for the given reports", done => {
      const report = { name: "Report Name" }
      const data = { rows: [1, 2, 3] }
      const processedData = { data: [1, 2, 3] }

      let fetchDataCalled = false
      let processedDataCalled = false

      GoogleAnalyticsClient.fetchData = (reportInput) => {
        fetchDataCalled = true
        expect(reportInput).to.equal(report)
        return Promise.resolve(data)
      }
      GoogleAnalyticsDataProcessor.processData = (reportInput, dataInput) => {
        processedDataCalled = true
        expect(reportInput).to.equal(report)
        expect(dataInput).to.equal(data)
        return Promise.resolve(processedData)
      }

      Analytics.query(report).then(results => {
        expect(results).to.equal(processedData)
        expect(fetchDataCalled).to.be.true
        expect(processedDataCalled).to.be.true
        done()
      }).catch(done)
    })

    it("should reject if no report is provided", done => {
      Analytics.query().catch(err => {
        expect(err.message).to.equal("Analytics.query missing required argument `report`")
        done()
      }).catch(done)
    })
  })

  describe(".reports", () => {
    it("should load reports", () => {
      expect(Analytics.reports).to.be.an("array")
    })
  })
})
