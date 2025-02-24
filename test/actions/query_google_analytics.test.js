const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const dataFixture = require("../support/fixtures/data");
const AnalyticsData = require("../../src/analytics_data");
const googleAnalyticsService = { runReportQuery: sinon.stub() };
const GoogleAnalyticsQueryBuilder = { buildQueries: sinon.stub() };
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
    const googleAnalyticsQueries = [{ name: "users", realtime: true }];
    let data;
    let unprocessedGoogleAnalyticsReportData;
    const reportConfig = { name: "foobar", realtime: true };
    const appConfig = { fake: "config" };
    const expectedReportData = [
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "00",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "01",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "02",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "03",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "04",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "05",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "06",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "07",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "08",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "09",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "10",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "11",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "12",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "13",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "14",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "15",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "16",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "17",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "18",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "19",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "20",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "21",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "22",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
      {
        activeUsers: "100",
        date: "2017-01-30",
        hour: "23",
        totalUsers: "100",
        visits: "100",
        yearMonth: "January 2017",
      },
    ];

    beforeEach(async () => {
      data = Object.assign({}, dataFixture);
      unprocessedGoogleAnalyticsReportData =
        AnalyticsData.fromGoogleAnalyticsQuery(googleAnalyticsQueries[0], [
          data,
        ]);
      debugLogSpy.resetHistory();
      GoogleAnalyticsQueryBuilder.buildQueries.resetHistory();
      googleAnalyticsService.runReportQuery.resetHistory();
      GoogleAnalyticsQueryBuilder.buildQueries.returns(googleAnalyticsQueries);
      googleAnalyticsService.runReportQuery.returns(
        unprocessedGoogleAnalyticsReportData,
      );
      context = {
        logger: { debug: debugLogSpy },
        reportConfig: reportConfig,
        appConfig: appConfig,
      };
      await subject.executeStrategy(context);
    });

    it("calls GoogleAnalyticsQueryBuilder.buildQueries with the expected params", () => {
      expect(
        GoogleAnalyticsQueryBuilder.buildQueries.calledWith(
          reportConfig,
          appConfig,
        ),
      ).to.equal(true);
    });

    it("calls googleAnalyticsService.runReportQuery with the expected params", () => {
      expect(
        googleAnalyticsService.runReportQuery.calledWith(
          googleAnalyticsQueries[0],
          reportConfig.realtime,
        ),
      ).to.equal(true);
    });

    it("sets the google analytics report response to the context store", () => {
      expect(context.googleAnalyticsReportData[0].name).to.equal(
        reportConfig.name,
      );
      expect(context.googleAnalyticsReportData[0].report.data).to.deep.equal(
        expectedReportData,
      );
      expect(context.googleAnalyticsReportData[0].report.query).to.equal(
        googleAnalyticsQueries[0],
      );
      expect(context.googleAnalyticsReportData[0].report.totals).to.deep.equal({
        activeUsers: 2400,
        totalUsers: 2400,
        visits: 2400,
      });
    });
  });
});
