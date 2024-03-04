const expect = require("chai").expect;
const sinon = require("sinon");
const GoogleAnalyticsService = require("../../src/google-analytics/service");

describe("GoogleAnalyticsService", () => {
  const googleAnalyticsQueryAuthorizer = {
    authorizeQuery: (query) => Promise.resolve(query),
  };
  const analyticsDataClient = {
    runRealtimeReport: sinon.stub(),
    runReport: sinon.stub(),
  };
  let subject;

  beforeEach(() => {
    analyticsDataClient.runRealtimeReport.resetHistory();
    analyticsDataClient.runReport.resetHistory();
    subject = new GoogleAnalyticsService(
      analyticsDataClient,
      googleAnalyticsQueryAuthorizer,
    );
  });

  describe(".runReportQuery", () => {
    const query = { foo: "bar" };

    describe("when isRealtime is true", () => {
      let result;

      beforeEach(async () => {
        analyticsDataClient.runRealtimeReport.returns(query);
        result = await subject.runReportQuery(query, true);
      });

      it("calls runRealtimeReport on the analytics data client", () => {
        expect(
          analyticsDataClient.runRealtimeReport.calledWith(query),
        ).to.equal(true);
      });

      it("returns the result of the realtime report call", () => {
        expect(result).to.eql(query);
      });
    });

    describe("when isRealtime is false", () => {
      let result;

      beforeEach(async () => {
        analyticsDataClient.runReport.returns(query);
        result = await subject.runReportQuery(query, false);
      });

      it("calls runRealtimeReport on the analytics data client", () => {
        expect(analyticsDataClient.runReport.calledWith(query)).to.equal(true);
      });

      it("returns the result of the realtime report call", () => {
        expect(result).to.eql(query);
      });
    });

    describe("when isRealtime is not set", () => {
      let result;

      beforeEach(async () => {
        analyticsDataClient.runReport.returns(query);
        result = await subject.runReportQuery(query);
      });

      it("calls runRealtimeReport on the analytics data client", () => {
        expect(analyticsDataClient.runReport.calledWith(query)).to.equal(true);
      });

      it("returns the result of the realtime report call", () => {
        expect(result).to.eql(query);
      });
    });
  });
});
