const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const googleAnalyticsService = { runReportQuery: sinon.stub() };
const GoogleAnalyticsQueryBuilder = { buildQuery: sinon.stub() };
const QueryGoogleAnalytics = proxyquire(
  "../../src/actions/query_google_analytics",
  {
    "../google_analytics/query_builder": GoogleAnalyticsQueryBuilder,
  },
);

describe("QueryGoogleAnalytics", () => {
  let subject;

  beforeEach(() => {
    subject = new QueryGoogleAnalytics(googleAnalyticsService);
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();
    const rawGoogleAnalyticsReportData = [{ foo: "bar" }];
    const googleAnalyticsQuery = { name: "users", realtime: true };
    const reportConfig = { name: "foobar", realtime: true };
    const config = { fake: "config" };
    let store;
    const context = {
      getStore: () => {
        return store;
      },
    };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      GoogleAnalyticsQueryBuilder.buildQuery.resetHistory();
      googleAnalyticsService.runReportQuery.resetHistory();
      GoogleAnalyticsQueryBuilder.buildQuery.returns(googleAnalyticsQuery);
      googleAnalyticsService.runReportQuery.returns(
        rawGoogleAnalyticsReportData,
      );
      store = new Map([
        ["rawGoogleAnalyticsReportData", rawGoogleAnalyticsReportData],
        ["googleAnalyticsQuery", googleAnalyticsQuery],
        ["logger", { debug: debugLogSpy }],
        ["reportConfig", reportConfig],
        ["config", config],
      ]);
      await subject.executeStrategy(context);
    });

    it("calls GoogleAnalyticsQueryBuilder.buildQuery with the expected params", () => {
      expect(
        GoogleAnalyticsQueryBuilder.buildQuery.calledWith(reportConfig, config),
      ).to.equal(true);
    });

    it("sets the google analytics query to the context store", () => {
      expect(context.getStore().get("googleAnalyticsQuery")).to.equal(
        googleAnalyticsQuery,
      );
    });

    it("calls googleAnalyticsService.runReportQuery with the expected params", () => {
      expect(
        googleAnalyticsService.runReportQuery.calledWith(
          googleAnalyticsQuery,
          reportConfig.realtime,
        ),
      ).to.equal(true);
    });

    it("sets the raw google analytics report response to the context store", () => {
      expect(context.getStore().get("rawGoogleAnalyticsReportData")).to.equal(
        rawGoogleAnalyticsReportData,
      );
    });
  });
});
