const chai = require("chai");
const expect = chai.expect;
const reportFixture = require("../support/fixtures/report");
const dataFixture = require("../support/fixtures/data");
const AnalyticsData = require("../../src/analytics_data");

const ResultFormatter = require("../../src/process_results/result_formatter");

describe("ResultFormatter", () => {
  describe("formatResult(result, options)", () => {
    let report;
    let data;

    beforeEach(() => {
      report = Object.assign({}, reportFixture);
      data = Object.assign({}, dataFixture);
    });

    it("should format results into JSON if the format is 'json'", async () => {
      const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
        report.query,
        [data],
      )[0];
      analyticsData.name = report.name;
      analyticsData.processData(report);
      analyticsData.addTotals(report);
      const result = analyticsData.toJSON();

      await ResultFormatter.formatResult(result, { format: "json" }).then(
        (formattedResult) => {
          const json = JSON.parse(formattedResult);
          json.data.forEach((row, index) => {
            // Each CSV row should match 2017-01-30,00,100,January 2017,100,100
            expect(row).to.deep.equal({
              date: "2017-01-30",
              hour: data.rows[index].dimensionValues[1].value,
              yearMonth: "January 2017",
              visits: "100",
              totalUsers: "100",
              activeUsers: "100",
            });
          });
        },
      );
    });

    it("should remove the data attribute for JSON if options.slim is true", async () => {
      const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
        report.query,
        [data],
      )[0];
      analyticsData.name = report.name;
      analyticsData.processData(report);
      analyticsData.addTotals(report);
      const result = analyticsData.toJSON();

      await ResultFormatter.formatResult(result, {
        format: "json",
        slim: true,
      }).then((formattedResult) => {
        const object = JSON.parse(formattedResult);
        expect(object.data).to.be.undefined;
      });
    });

    it("should reject if the data cannot be JSON stringified", async () => {
      const array = [];
      array[0] = array;

      await ResultFormatter.formatResult(array).catch((e) => {
        expect(e).to.match(/TypeError: Converting circular structure to JSON/);
      });
    });

    it("should format results into CSV if the format is 'csv'", async () => {
      const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
        report.query,
        [data],
      )[0];
      analyticsData.name = report.name;
      analyticsData.processData(report);
      analyticsData.addTotals(report);
      const result = analyticsData.toJSON();

      await ResultFormatter.formatResult(result, {
        format: "csv",
        slim: true,
      }).then((formattedResult) => {
        const lines = formattedResult.split("\n");
        const [header, ...rows] = lines;

        expect(header).to.equal(
          "date,hour,Month-Year,Total Users,Active Users,visits",
        );
        rows.forEach((row) => {
          // Each CSV row should match 2017-01-30,00,100,January 2017,100,100
          expect(row).to.match(
            /[0-9]{4}-[0-9]{2}-[0-9]{2},[0-9]{2},January 2017,100,100,100/,
          );
        });
      });
    });

    it("should throw an error if the format is unsupported", async () => {
      const analyticsData = AnalyticsData.fromGoogleAnalyticsQuery(
        report.query,
        [data],
      )[0];
      analyticsData.name = report.name;
      analyticsData.processData(report);
      analyticsData.addTotals(report);
      const result = analyticsData.toJSON();

      await ResultFormatter.formatResult(result, {
        format: "xml",
        slim: true,
      }).catch((e) => {
        expect(e).to.equal("Unsupported format: xml");
      });
    });
  });
});
