const expect = require("chai").expect;
const sinon = require("sinon");

const analyticsDataProcessor = { processData: sinon.stub() };
const ProcessGoogleAnalyticsResults = require("../../src/actions/process_google_analytics_results");

describe("ProcessGoogleAnalyticsResults", () => {
  let subject;

  beforeEach(() => {
    subject = new ProcessGoogleAnalyticsResults(analyticsDataProcessor);
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();
    const rawGoogleAnalyticsReportData = [{ foo: "bar" }];
    const googleAnalyticsQuery = { name: "users", realtime: true };
    const reportConfig = { name: "foobar" };
    let store;
    const context = {
      getStore: () => {
        return store;
      },
    };
    const processedAnalyticsData = { fake: "data" };

    beforeEach(async () => {
      debugLogSpy.resetHistory();
      analyticsDataProcessor.processData.resetHistory();
      analyticsDataProcessor.processData.returns(processedAnalyticsData);
      store = new Map([
        ["rawGoogleAnalyticsReportData", rawGoogleAnalyticsReportData],
        ["googleAnalyticsQuery", googleAnalyticsQuery],
        ["logger", { debug: debugLogSpy }],
        ["reportConfig", reportConfig],
      ]);
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
      expect(context.getStore().get("processedAnalyticsData")).to.equal(
        processedAnalyticsData,
      );
    });
  });
});
