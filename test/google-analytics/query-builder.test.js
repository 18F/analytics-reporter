const expect = require("chai").expect
const proxyquire = require("proxyquire")
const reportFixture = require("../support/fixtures/report")

proxyquire.noCallThru()

const config = {}

const GoogleAnalyticsQueryBuilder = proxyquire("../../src/google-analytics/query-builder", {
  "../config": config,
})

describe("GoogleAnalyticsQueryBuilder", () => {
  describe(".buildQuery(report)", () => {
    let report

    beforeEach(() => {
      report = Object.assign({}, reportFixture)
      config.account = {
        ids: "ga:123456",
      }
    })

    it("should set the properties from the query object on the report", () => {
      report.query = {
        a: "123abc",
        b: "456def",
      }

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query.a).to.equal("123abc")
      expect(query.b).to.equal("456def")
    })

    it("should convert dimensions and metrics arrays into comma separated strings", () => {
      report.query.dimensions = ["ga:date", "ga:hour"]
      report.query.metrics = ["ga:sessions"]

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query.dimensions).to.equal("ga:date,ga:hour")
      expect(query.metrics).to.equal("ga:sessions")
    })

    it("should convert filters array into a semicolon separated string", () => {
      report.query.filters = [
        "ga:browser==Internet Explorer",
        "ga:operatingSystem==Windows",
      ]

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query.filters).to.equal(
        "ga:browser==Internet Explorer;ga:operatingSystem==Windows"
      )
    })

    it("should set the samplingLevel to HIGHER_PRECISION", () => {
      report.query.samplingLevel = undefined

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query.samplingLevel).to.equal("HIGHER_PRECISION")
    })

    it("should set max-results if it is set on the report", () => {
      report.query["max-results"] = 3

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query["max-results"]).to.equal(3)
    })

    it("should set max-results to 10000 if it is unset on the report", () => {
      report.query["max-results"] = undefined

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query["max-results"]).to.equal(10000)
    })

    it("should set the ids to the account ids specified by the config", () => {
      config.account.ids = "ga:abc123"

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report)
      expect(query.ids).to.equal("ga:abc123")
    })
  })
})
