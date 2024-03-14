const expect = require("chai").expect;
const sinon = require("sinon");
const GoogleAnalyticsService = require("../../src/google-analytics/service");

describe("GoogleAnalyticsService", () => {
  const googleAnalyticsQueryAuthorizer = {
    authorizeQuery: sinon.stub(),
  };
  const analyticsDataClient = {
    runRealtimeReport: sinon.stub(),
    runReport: sinon.stub(),
  };
  const config = {
    ga4_call_retry_count: 5,
    ga4_call_retry_delay: 1,
  };
  const logger = {
    debug: () => {},
  };
  let subject;

  beforeEach(() => {
    analyticsDataClient.runRealtimeReport.reset();
    analyticsDataClient.runReport.reset();
    subject = new GoogleAnalyticsService(
      analyticsDataClient,
      googleAnalyticsQueryAuthorizer,
      config,
      logger,
    );
  });

  describe(".runReportQuery", () => {
    const query = { foo: "bar" };

    beforeEach(() => {
      googleAnalyticsQueryAuthorizer.authorizeQuery.callsFake((query) =>
        Promise.resolve(query),
      );
    });

    describe("when isRealtime is true", () => {
      describe("and the API calls are successful", () => {
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

      describe("and the authorizeQuery call has an error", () => {
        let retryCount;

        beforeEach(async () => {
          googleAnalyticsQueryAuthorizer.authorizeQuery.reset();
          retryCount = -1;
          googleAnalyticsQueryAuthorizer.authorizeQuery.callsFake(() => {
            retryCount = retryCount + 1;
            return Promise.reject(new Error("You broke it"));
          });

          /* eslint-disable no-empty */
          try {
            await subject.runReportQuery(query, true);
          } catch (e) {}
          /* eslint-enable no-empty */
        });

        it("retries the configured number of times", () => {
          expect(retryCount).to.equal(config.ga4_call_retry_count);
        });
      });

      describe("and the runRealtimeReport call has an error", () => {
        let retryCount;

        beforeEach(async () => {
          analyticsDataClient.runRealtimeReport.reset();
          retryCount = -1;
          analyticsDataClient.runRealtimeReport.callsFake(() => {
            retryCount = retryCount + 1;
            return Promise.reject(new Error("You broke it"));
          });

          /* eslint-disable no-empty */
          try {
            await subject.runReportQuery(query, true);
          } catch (e) {}
          /* eslint-enable no-empty */
        });

        it("retries the configured number of times", () => {
          expect(retryCount).to.equal(config.ga4_call_retry_count);
        });
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
      beforeEach(() => {
        analyticsDataClient.runReport.returns(query);
      });

      describe("and the API calls are successful", () => {
        let result;

        beforeEach(async () => {
          result = await subject.runReportQuery(query);
        });

        it("calls runRealtimeReport on the analytics data client", () => {
          expect(analyticsDataClient.runReport.calledWith(query)).to.equal(
            true,
          );
        });

        it("returns the result of the realtime report call", () => {
          expect(result).to.eql(query);
        });
      });

      describe("and the authorizeQuery call has an error", () => {
        let retryCount;

        beforeEach(async () => {
          googleAnalyticsQueryAuthorizer.authorizeQuery.reset();
          retryCount = -1;
          googleAnalyticsQueryAuthorizer.authorizeQuery.callsFake(() => {
            retryCount = retryCount + 1;
            return Promise.reject(new Error("You broke it"));
          });

          /* eslint-disable no-empty */
          try {
            await subject.runReportQuery(query);
          } catch (e) {}
          /* eslint-enable no-empty */
        });

        it("retries the configured number of times", () => {
          expect(retryCount).to.equal(config.ga4_call_retry_count);
        });
      });

      describe("and the runReport call has an error", () => {
        let retryCount;

        beforeEach(async () => {
          analyticsDataClient.runReport.reset();
          retryCount = -1;
          analyticsDataClient.runReport.callsFake(() => {
            retryCount = retryCount + 1;
            return Promise.reject(new Error("You broke it"));
          });

          /* eslint-disable no-empty */
          try {
            await subject.runReportQuery(query);
          } catch (e) {}
          /* eslint-enable no-empty */
        });

        it("retries the configured number of times", () => {
          expect(retryCount).to.equal(config.ga4_call_retry_count);
        });
      });
    });
  });
});
