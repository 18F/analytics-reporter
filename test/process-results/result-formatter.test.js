const csv = require("fast-csv")
const expect = require("chai").expect
const proxyquire = require("proxyquire")
const reportFixture = require("../support/fixtures/report")
const dataFixture = require("../support/fixtures/data")

const GoogleAnalyticsDataProcessor = proxyquire("../../src/process-results/ga-data-processor", {
  "../config": { account: { hostname: "" } },
})
const ResultFormatter = require("../../src/process-results/result-formatter")

describe("ResultFormatter", () => {
  describe("formatResult(result, options)", () => {
    let report
    let data

    beforeEach(() => {
      report = Object.assign({}, reportFixture)
      data = Object.assign({}, dataFixture)
    })

    it("should format results into JSON if the format is 'json'", done => {
      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      ResultFormatter.formatResult(result, { format: "json" }).then(formattedResult => {
        const object = JSON.parse(formattedResult)
        expect(object).to.deep.equal(object)
        done()
      }).catch(done)
    })

    it("should remove the data attribute for JSON if options.slim is true", done => {
      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      ResultFormatter.formatResult(result, { format: "json", slim: true }).then(formattedResult => {
        const object = JSON.parse(formattedResult)
        expect(object.data).to.be.undefined
        done()
      }).catch(done)
    })

    it("should format results into CSV if the format is 'csv'", done => {
      const result = GoogleAnalyticsDataProcessor.processData(report, data)

      ResultFormatter.formatResult(result, { format: "csv", slim: true }).then(formattedResult => {
        csv.fromString(formattedResult, { strictColumnHandling: true }, { headers: true })
          .on("invalid-data", (data) => {
            done(new Error("Invalid CSV data: " + data))
          })
          .on("finish", () => {
            done()
          })
      }).catch(done)
    })
  })
})
