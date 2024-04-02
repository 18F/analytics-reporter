const expect = require("chai").expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const ResultFormatter = { formatResult: sinon.stub() };
const FormatProcessedAnalyticsData = proxyquire(
  "../../src/actions/format_processed_analytics_data",
  {
    "../process_results/result_formatter": ResultFormatter,
  },
);

describe("FormatProcessedAnalyticsData", () => {
  let store;
  const context = {
    getStore: () => {
      return store;
    },
  };
  let subject;

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();

    beforeEach(() => {
      debugLogSpy.resetHistory();
      ResultFormatter.formatResult.resetHistory();
      subject = new FormatProcessedAnalyticsData();
    });

    describe("when report should be slim formatted", () => {
      const formattedAnalyticsData = { slim: true };
      const processedAnalyticsData = { foo: "bar" };
      const config = { format: "json", slim: true };
      const reportConfig = { name: "foobar", slim: true };

      beforeEach(async () => {
        ResultFormatter.formatResult.returns(formattedAnalyticsData);
        store = new Map([
          ["config", config],
          ["processedAnalyticsData", processedAnalyticsData],
          ["logger", { debug: debugLogSpy }],
          ["reportConfig", reportConfig],
        ]);
        await subject.executeStrategy(context);
      });

      it("calls result formatter with processed analytics data and config options", () => {
        expect(
          ResultFormatter.formatResult.calledWith(processedAnalyticsData, {
            format: "json",
            slim: true,
          }),
        );
      });

      it("sets the formatted data to the context store", () => {
        expect(context.getStore().get("formattedAnalyticsData")).to.equal(
          formattedAnalyticsData,
        );
      });
    });

    describe("when report should not be slim formatted", () => {
      const formattedAnalyticsData = { slim: false };
      const processedAnalyticsData = { foo: "bar" };
      const config = { format: "csv", slim: true };
      const reportConfig = { name: "foobar", slim: true };

      beforeEach(async () => {
        ResultFormatter.formatResult.returns(formattedAnalyticsData);
        store = new Map([
          ["config", config],
          ["processedAnalyticsData", processedAnalyticsData],
          ["logger", { debug: debugLogSpy }],
          ["reportConfig", reportConfig],
        ]);
        await subject.executeStrategy(context);
      });

      it("calls result formatter with processed analytics data and config options", () => {
        expect(
          ResultFormatter.formatResult.calledWith(processedAnalyticsData, {
            format: "csv",
            slim: false,
          }),
        );
      });

      it("sets the formatted data to the context store", () => {
        expect(context.getStore().get("formattedAnalyticsData")).to.equal(
          formattedAnalyticsData,
        );
      });
    });
  });
});
