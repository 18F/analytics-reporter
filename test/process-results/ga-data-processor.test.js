const expect = require("chai").expect
const proxyquire = require("proxyquire")
const reportFixture = require("../support/fixtures/report")
const dataFixture = require("../support/fixtures/data")
const dataWithHostnameFixture = require("../support/fixtures/data_with_hostname")

proxyquire.noCallThru()

const config = {}

const GoogleAnalyticsDataProcessor = proxyquire("../../src/process-results/ga-data-processor", {
  "../config": config,
})

describe("GoogleAnalyticsDataProcessor", () => {
  describe(".processData(report, data)", () => {
    let report
    let data

    beforeEach(() => {
      report = Object.assign({}, reportFixture)
      data = Object.assign({}, dataFixture)
      config.account = {
        hostname: ""
      }
    })

    it("should return results with the correct props", () => {
      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.name).to.be.a("string")
      expect(result.query).be.an("object")
      expect(result.meta).be.an("object")
      expect(result.data).be.an("array")
      expect(result.totals).be.an("object")
      expect(result.totals).be.an("object")
      expect(result.taken_at).be.a("date")
    })

    it("should return results with an empty data array if data is undefined or has no rows", () => {
      data.rows = []
      expect(GoogleAnalyticsDataProcessor.processData(report, data).data).to.be.empty
      data.rows = undefined
      expect(GoogleAnalyticsDataProcessor.processData(report, data).data).to.be.empty
    })

    it("should delete the query ids for the GA response", () => {
      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.query).to.not.have.property("ids")
    })

    it("should map data from GA keys to DAP keys", () => {
      data.columnHeaders = [
        { name: "ga:date" }, { name: "ga:browser"}, { name: "ga:city" }
      ]
      data.rows = [["20170130", "chrome", "Baton Rouge, La"]]

      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(Object.keys(result.data[0])).to.deep.equal(["date", "browser", "city"])
    })

    it("should format dates", () => {
      data.columnHeaders = [{ name: 'ga:date' }]
      data.rows = [[ "20170130" ]]

      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.data[0].date).to.equal("2017-01-30")
    })

    it("should filter rows that don't meet the threshold if a threshold is provided", () => {
      report.threshold = {
        field: "unmapped_column",
        value: "10",
      }
      data.columnHeaders = [{ name: "unmapped_column" }]
      data.rows = [[20], [5], [15]]

      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.data).to.have.length(2)
      expect(result.data.map(row => row.unmapped_column)).to.deep.equal([20, 15])
    })

    it("should remove dimensions that are specified by the cut prop", () => {
      report.cut = "unmapped_column"
      data.columnHeaders = [{ name: "ga:hostname" }, { name: "unmapped_column" }]
      data.rows = [["www.example.gov", 10000000]]

      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.data[0].unmapped_column).to.be.undefined
    })

    it("should add a hostname to realtime data if a hostname is specified by the config", () => {
      report.realtime = true
      config.account.hostname = "www.example.gov"

      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.data[0].domain).to.equal("www.example.gov")
    })

    it("should not overwrite the domain with a hostname from the config", () => {
      let dataWithHostname
      dataWithHostname = Object.assign({}, dataWithHostnameFixture)
      report.realtime = true
      config.account.hostname = "www.example.gov"

      const result = GoogleAnalyticsDataProcessor.processData(report, dataWithHostname)
      expect(result.data[0].domain).to.equal("www.example0.com")
    })

    it("should set use ResultTotalsCalculator to calculate the totals", () => {
      const calculateTotals = (result) => {
        expect(result.name).to.equal(report.name)
        expect(result.data).to.be.an("array")
        return { "visits": 1234 }
      }
      const GoogleAnalyticsDataProcessor = proxyquire("../../src/process-results/ga-data-processor", {
        "./config": config,
        "./result-totals-calculator": { calculateTotals },
      })

      const result = GoogleAnalyticsDataProcessor.processData(report, data)
      expect(result.totals).to.deep.equal({ "visits": 1234 })
    })
  })
})
