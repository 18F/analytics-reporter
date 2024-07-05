const expect = require("chai").expect;
const GoogleAnalyticsCredentialLoader = require("../../src/google_analytics/credential_loader");

describe("GoogleAnalyticsCredentialLoader", () => {
  const subject = GoogleAnalyticsCredentialLoader;
  let appConfig;

  describe(".getCredentials(appConfig)", () => {
    beforeEach(() => {
      appConfig = {};
    });

    describe("when appConfig.key is set", () => {
      let result;

      beforeEach(() => {
        appConfig.email = "test@example.com";
        appConfig.key = "Shh, this is a secret";
        result = subject.getCredentials(appConfig);
      });

      it("returns the key and email in the appConfig", () => {
        expect(result).to.eql({ key: appConfig.key, email: appConfig.email });
      });
    });

    describe("when appConfig.key_file is set", () => {
      describe("and the keyfile is a PEM file", () => {
        let result;

        beforeEach(() => {
          appConfig.email = "test@example.com";
          appConfig.key = undefined;
          appConfig.key_file = "./test/support/fixtures/secret_key.pem";
          result = subject.getCredentials(appConfig);
        });

        it("returns the key from the key file and email from the appConfig", () => {
          expect(result).to.eql({
            key: "pem-key-file-not-actually-a-secret-key",
            email: appConfig.email,
          });
        });
      });

      describe("and the keyfile is a JSON file", () => {
        let result;

        beforeEach(() => {
          appConfig.email = "test@example.com";
          appConfig.key = undefined;
          appConfig.key_file = "./test/support/fixtures/secret_key.json";
          result = subject.getCredentials(appConfig);
        });

        it("returns the key and email from the key file", () => {
          expect(result).to.eql({
            key: "json-key-file-not-actually-a-secret-key",
            email: "json_test_email@example.com",
          });
        });
      });
    });

    describe("when appConfig.analytics_credentials is set", () => {
      describe("and the credentials are an object", () => {
        let result;

        beforeEach(() => {
          subject.analyticsCredentialsIndex = 0;
          appConfig.analytics_credentials = Buffer.from(
            `{
               "email": "email@example.com",
               "key": "this-is-a-secret"
             }`,
            "utf8",
          ).toString("base64");
          result = subject.getCredentials(appConfig);
        });

        it("returns the credentials", () => {
          expect(result).to.eql({
            email: "email@example.com",
            key: "this-is-a-secret",
          });
        });
      });

      describe("and the credentials are an array", () => {
        let firstResult;
        let secondResult;
        let thirdResult;

        beforeEach(() => {
          subject.analyticsCredentialsIndex = 0;
          appConfig.analytics_credentials = Buffer.from(
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

          firstResult = subject.getCredentials(appConfig);
          secondResult = subject.getCredentials(appConfig);
          thirdResult = subject.getCredentials(appConfig);
        });

        it("returns the first item in the array on first call", () => {
          expect(firstResult).to.eql({
            email: "email_1@example.com",
            key: "this-is-a-secret-1",
          });
        });

        it("returns the second item in the array on second call", () => {
          expect(secondResult).to.eql({
            email: "email_2@example.com",
            key: "this-is-a-secret-2",
          });
        });

        it("returns the third item in the array on third call", () => {
          expect(thirdResult).to.eql({
            email: "email_1@example.com",
            key: "this-is-a-secret-1",
          });
        });
      });
    });
  });
});
