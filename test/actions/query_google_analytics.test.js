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
  let context;
  let subject;

  beforeEach(() => {
    subject = new QueryGoogleAnalytics(googleAnalyticsService);
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();
    const rawGoogleAnalyticsReportData = [{ foo: "bar" }];
    const googleAnalyticsQuery = { name: "users", realtime: true };
    const reportConfig = { name: "foobar", realtime: true };
    const appConfig = { fake: "config" };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      GoogleAnalyticsQueryBuilder.buildQuery.resetHistory();
      googleAnalyticsService.runReportQuery.resetHistory();
      GoogleAnalyticsQueryBuilder.buildQuery.returns(googleAnalyticsQuery);
      googleAnalyticsService.runReportQuery.returns(
        rawGoogleAnalyticsReportData,
      );
      context = {
        rawGoogleAnalyticsReportData: rawGoogleAnalyticsReportData,
        googleAnalyticsQuery: googleAnalyticsQuery,
        logger: { debug: debugLogSpy },
        reportConfig: reportConfig,
        appConfig: appConfig,
      };
      await subject.executeStrategy(context);
    });

    it("calls GoogleAnalyticsQueryBuilder.buildQuery with the expected params", () => {
      expect(
        GoogleAnalyticsQueryBuilder.buildQuery.calledWith(
          reportConfig,
          appConfig,
        ),
      ).to.equal(true);
    });

    it("sets the google analytics query to the context store", () => {
      expect(context.googleAnalyticsQuery).to.equal(googleAnalyticsQuery);
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
      expect(context.rawGoogleAnalyticsReportData).to.equal(
        rawGoogleAnalyticsReportData,
      );
    });
  });
});
