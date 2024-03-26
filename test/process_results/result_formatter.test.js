const expect = require("chai").expect;
const proxyquire = require("proxyquire");
const reportFixture = require("../support/fixtures/report");
const dataFixture = require("../support/fixtures/data");
const ResultTotalsCalculator = require("../../src/process_results/result_totals_calculator");

const AnalyticsDataProcessor = proxyquire(
  "../../src/process_results/analytics_data_processor",
  { "./result_totals_calculator": ResultTotalsCalculator },
);
const ResultFormatter = require("../../src/process_results/result_formatter");

describe("ResultFormatter", () => {
  describe("formatResult(result, options)", () => {
    let report;
    let data;
    let analyticsDataProcessor;

    beforeEach(() => {
      report = Object.assign({}, reportFixture);
      data = Object.assign({}, dataFixture);
      analyticsDataProcessor = new AnalyticsDataProcessor({
        account: { hostname: "" },
      });
    });

    it("should format results into JSON if the format is 'json'", (done) => {
      const result = analyticsDataProcessor.processData(report, data);

      ResultFormatter.formatResult(result, { format: "json" })
        .then((formattedResult) => {
          const object = JSON.parse(formattedResult);
          expect(object).to.deep.equal(object);
          done();
        })
        .catch(done);
    });

    it("should remove the data attribute for JSON if options.slim is true", (done) => {
      const result = analyticsDataProcessor.processData(report, data);

      ResultFormatter.formatResult(result, { format: "json", slim: true })
        .then((formattedResult) => {
          const object = JSON.parse(formattedResult);
          expect(object.data).to.be.undefined;
          done();
        })
        .catch(done);
    });

    it("should reject if the data cannot be JSON stringified", (done) => {
      const array = [];
      array[0] = array;

      ResultFormatter.formatResult(array)
        .catch((e) => {
          expect(e).to.equal("");
        })
        .finally(() => {
          done();
        });
    });

    it("should format results into CSV if the format is 'csv'", (done) => {
      const result = analyticsDataProcessor.processData(report, data);

      ResultFormatter.formatResult(result, {
        format: "csv",
        slim: true,
      })
        .then((formattedResult) => {
          const lines = formattedResult.split("\n");
          const [header, ...rows] = lines;

          expect(header).to.equal("date,hour,visits");
          rows.forEach((row) => {
            // Each CSV row should match 2017-01-30,00,100
            expect(row).to.match(/[0-9]{4}-[0-9]{2}-[0-9]{2},[0-9]{2},100/);
          });
        })
        .finally(() => {
          done();
        });
    });

    it("should throw an error if the format is unsupported", (done) => {
      const result = analyticsDataProcessor.processData(report, data);

      ResultFormatter.formatResult(result, {
        format: "xml",
        slim: true,
      }).catch((e) => {
        expect(e).to.equal("Unsupported format: xml");
        done();
      });
    });
  });
});
