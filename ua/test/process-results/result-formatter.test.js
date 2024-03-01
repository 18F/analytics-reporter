const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const reportFixture = require("../support/fixtures/report");
const dataFixture = require("../support/fixtures/data");

const GoogleAnalyticsDataProcessor = proxyquire(
  "../../src/process-results/ga-data-processor",
  {
    "../config": { account: { hostname: "" } },
  },
);
const ResultFormatter = require("../../src/process-results/result-formatter");

describe("UA ResultFormatter", () => {
  describe("formatResult(result, options)", () => {
    let report;
    let data;
    let responseData;

    beforeEach(() => {
      report = Object.assign({}, reportFixture);
      data = Object.assign({}, dataFixture);
      responseData = { data: data };
    });

    it("should format results into JSON if the format is 'json'", (done) => {
      const result = GoogleAnalyticsDataProcessor.processData(
        report,
        responseData,
      );

      ResultFormatter.formatResult(result, { format: "json" })
        .then((formattedResult) => {
          const object = JSON.parse(formattedResult);
          expect(object).to.deep.equal(object);
          done();
        })
        .catch(done);
    });

    it("should remove the data attribute for JSON if options.slim is true", (done) => {
      const result = GoogleAnalyticsDataProcessor.processData(
        report,
        responseData,
      );

      ResultFormatter.formatResult(result, { format: "json", slim: true })
        .then((formattedResult) => {
          const object = JSON.parse(formattedResult);
          expect(object.data).to.be.undefined;
          done();
        })
        .catch(done);
    });

    it("should format results into CSV if the format is 'csv'", () => {
      const result = GoogleAnalyticsDataProcessor.processData(
        report,
        responseData,
      );

      return ResultFormatter.formatResult(result, {
        format: "csv",
        slim: true,
      }).then((formattedResult) => {
        const lines = formattedResult.split("\n");
        const [header, ...rows] = lines;
        expect(header).to.equal("date,hour,visits");
        rows.forEach((row) => {
          // Each CSV row should match 2017-01-30,00,100
          expect(row).to.match(/[0-9]{4}-[0-9]{2}-[0-9]{2},[0-9]{2},100/);
        });
      });
    });
  });
});
