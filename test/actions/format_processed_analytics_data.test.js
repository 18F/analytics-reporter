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
  let context;
  let subject;

  describe(".handles", () => {
    beforeEach(() => {
      subject = new FormatProcessedAnalyticsData();
    });

    describe("when appConfig.formats has values", () => {
      beforeEach(() => {
        context = {
          appConfig: { formats: ["json"] },
        };
      });

      it("returns true", () => {
        expect(subject.handles(context)).to.equal(true);
      });
    });

    describe("when appConfig.formats does not have values", () => {
      beforeEach(() => {
        context = {
          appConfig: { formats: [] },
        };
      });

      it("returns false", () => {
        expect(subject.handles(context)).to.equal(false);
      });
    });
  });

  describe(".executeStrategy", () => {
    const debugLogSpy = sinon.spy();

    beforeEach(() => {
      debugLogSpy.resetHistory();
      ResultFormatter.formatResult.resetHistory();
      subject = new FormatProcessedAnalyticsData();
    });

    describe("when report should be slim formatted", () => {
      const formattedAnalyticsData = { slim: true };
      const googleAnalyticsReportData = [
        {
          name: "foobar",
          report: {
            data: { foo: "bar" },
          },
        },
      ];
      const appConfig = { formats: ["json"], slim: true };
      const reportConfig = { name: "foobar", slim: true };

      beforeEach(async () => {
        ResultFormatter.formatResult.returns(formattedAnalyticsData);
        context = {
          appConfig,
          googleAnalyticsReportData,
          logger: { debug: debugLogSpy },
          reportConfig,
        };
        await subject.executeStrategy(context);
      });

      it("calls result formatter with processed analytics data and config options", () => {
        expect(
          ResultFormatter.formatResult.calledWith(googleAnalyticsReportData, {
            format: "json",
            slim: true,
          }),
        );
      });

      it("sets the formatted data to the context store", () => {
        expect(context.formattedAnalyticsData).to.deep.equal([
          {
            json: {
              name: "foobar",
              report: formattedAnalyticsData,
            },
          },
        ]);
      });
    });

    describe("when report should not be slim formatted", () => {
      const formattedAnalyticsData = { slim: false };
      const googleAnalyticsReportData = [
        {
          name: "foobar",
          report: {
            data: { foo: "bar" },
          },
        },
      ];
      const appConfig = { formats: ["csv"], slim: true };
      const reportConfig = { name: "foobar", slim: true };

      beforeEach(async () => {
        ResultFormatter.formatResult.returns(formattedAnalyticsData);
        context = {
          appConfig,
          googleAnalyticsReportData,
          logger: { debug: debugLogSpy },
          reportConfig,
        };
        await subject.executeStrategy(context);
      });

      it("calls result formatter with processed analytics data and config options", () => {
        expect(
          ResultFormatter.formatResult.calledWith(googleAnalyticsReportData, {
            format: "csv",
            slim: false,
          }),
        );
      });

      it("sets the formatted data to the context store", () => {
        expect(context.formattedAnalyticsData).to.deep.equal([
          {
            csv: {
              name: "foobar",
              report: formattedAnalyticsData,
            },
          },
        ]);
      });
    });

    describe("when multiple formats are configured", () => {
      const formattedAnalyticsData = { slim: false };
      const googleAnalyticsReportData = [
        {
          name: "foobar",
          report: {
            data: { foo: "bar" },
          },
        },
      ];
      const appConfig = { formats: ["csv", "json"], slim: true };
      const reportConfig = { name: "foobar", slim: true };

      beforeEach(async () => {
        ResultFormatter.formatResult.returns(formattedAnalyticsData);
        context = {
          appConfig,
          googleAnalyticsReportData,
          logger: { debug: debugLogSpy },
          reportConfig,
        };
        await subject.executeStrategy(context);
      });

      it("calls result formatter with processed analytics data and config options for csv format", () => {
        expect(
          ResultFormatter.formatResult.calledWith(googleAnalyticsReportData, {
            format: "csv",
            slim: false,
          }),
        );
      });

      it("calls result formatter with processed analytics data and config options for csv format", () => {
        expect(
          ResultFormatter.formatResult.calledWith(googleAnalyticsReportData, {
            format: "json",
            slim: false,
          }),
        );
      });

      it("sets the formatted data to the context store", () => {
        expect(context.formattedAnalyticsData).to.deep.equal([
          {
            csv: {
              name: "foobar",
              report: formattedAnalyticsData,
            },
            json: {
              name: "foobar",
              report: formattedAnalyticsData,
            },
          },
        ]);
      });
    });
  });
});
