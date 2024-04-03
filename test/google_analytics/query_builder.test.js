const expect = require("chai").expect;
const reportFixture = require("../support/fixtures/report");
const GoogleAnalyticsQueryBuilder = require("../../src/google_analytics/query_builder");

const config = {};

describe("GoogleAnalyticsQueryBuilder", () => {
  describe(".buildQuery(report)", () => {
    let report;

    beforeEach(() => {
      report = Object.assign({}, reportFixture);
      config.account = {
        ids: "ga:123456",
      };
    });

    it("should set the properties from the query object on the report", () => {
      report.query = {
        a: "123abc",
        b: "456def",
      };

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report, config);
      expect(query.a).to.equal("123abc");
      expect(query.b).to.equal("456def");
    });

    it("should set limit if it is set on the report", () => {
      report.query["limit"] = "3";

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report, config);
      expect(query["limit"]).to.equal("3");
    });

    it("should set limit to 10000 if it is unset on the report", () => {
      report.query["limit"] = undefined;

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report, config);
      expect(query["limit"]).to.equal("10000");
    });

    it("should set the ids to the account ids specified by the config", () => {
      config.account.ids = "ga:abc123";

      const query = GoogleAnalyticsQueryBuilder.buildQuery(report, config);
      expect(query.ids).to.equal("ga:abc123");
    });
  });
});
