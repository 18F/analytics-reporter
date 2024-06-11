const expect = require("chai").expect;
const sinon = require("sinon");

const analyticsDataProcessor = { processData: sinon.stub() };
const ProcessGoogleAnalyticsResults = require("../../src/actions/process_google_analytics_results");

describe("ProcessGoogleAnalyticsResults", () => {
  let context;
  let subject;

  beforeEach(() => {
    subject = new ProcessGoogleAnalyticsResults(analyticsDataProcessor);
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();
    const rawGoogleAnalyticsReportData = [{ foo: "bar" }];
    const googleAnalyticsQuery = { name: "users", realtime: true };
    const reportConfig = { name: "foobar" };
    const processedAnalyticsData = { fake: "data" };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      analyticsDataProcessor.processData.resetHistory();
      analyticsDataProcessor.processData.returns(processedAnalyticsData);
      context = {
        rawGoogleAnalyticsReportData: rawGoogleAnalyticsReportData,
        googleAnalyticsQuery: googleAnalyticsQuery,
        logger: { debug: debugLogSpy },
        reportConfig: reportConfig,
      };
      await subject.executeStrategy(context);
    });

    it("calls analyticsDataProcessor.processData with the expected params", () => {
      expect(
        analyticsDataProcessor.processData.calledWith(
          reportConfig,
          rawGoogleAnalyticsReportData[0],
          googleAnalyticsQuery,
        ),
      ).to.equal(true);
    });

    it("sets the processed data to the context store", () => {
      expect(context.processedAnalyticsData).to.equal(processedAnalyticsData);
    });
  });
});
