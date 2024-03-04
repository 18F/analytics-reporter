const expect = require("chai").expect;
const GoogleAnalyticsCredentialLoader = require("../../src/google-analytics/credential-loader");

const config = {};

describe("GoogleAnalyticsCredentialLoader", () => {
  describe(".loadCredentials(config)", () => {
    beforeEach(() => {
      config.analytics_credentials = undefined;
      global.analyticsCredentialsIndex = 0;
    });

    it("should return the credentials if the credentials are an object", () => {
      config.analytics_credentials = Buffer.from(
        `{
        "email": "email@example.com",
        "key": "this-is-a-secret"
      }`,
        "utf8",
      ).toString("base64");

      const creds = GoogleAnalyticsCredentialLoader.loadCredentials(config);
      expect(creds.email).to.equal("email@example.com");
      expect(creds.key).to.equal("this-is-a-secret");
    });

    it("should return successive credentials if the credentials are an array", () => {
      config.analytics_credentials = Buffer.from(
        `[
        {
          "email": "email_1@example.com",
          "key": "this-is-a-secret-1"
        },
        {
          "email": "email_2@example.com",
          "key": "this-is-a-secret-2"
        }
      ]`,
        "utf8",
      ).toString("base64");

      const firstCreds =
        GoogleAnalyticsCredentialLoader.loadCredentials(config);
      const secondCreds =
        GoogleAnalyticsCredentialLoader.loadCredentials(config);
      const thirdCreds =
        GoogleAnalyticsCredentialLoader.loadCredentials(config);

      expect(firstCreds.email).to.equal("email_1@example.com");
      expect(firstCreds.key).to.equal("this-is-a-secret-1");
      expect(secondCreds.email).to.equal("email_2@example.com");
      expect(secondCreds.key).to.equal("this-is-a-secret-2");
      expect(thirdCreds.email).to.equal("email_1@example.com");
      expect(thirdCreds.key).to.equal("this-is-a-secret-1");
    });
  });
});
