const expect = require("chai").expect;
const knexfile = require("../knexfile");
const Config = require("../src/config");

describe("Config", () => {
  let subject;

  beforeEach(() => {
    subject = new Config();
  });

  describe(".format", () => {
    describe("when csv option is set", () => {
      beforeEach(() => {
        subject = new Config({ csv: true });
      });

      it("returns 'csv'", () => {
        expect(subject.format).to.equal("csv");
      });
    });

    describe("when csv option is omitted", () => {
      beforeEach(() => {
        subject = new Config({});
      });

      it("returns 'json'", () => {
        expect(subject.format).to.equal("json");
      });
    });
  });

  describe(".output", () => {
    beforeEach(() => {
      subject = new Config({ output: "foobar" });
    });

    it("returns the output option", () => {
      expect(subject.output).to.equal("foobar");
    });
  });

  describe(".shouldPublishToDisk", () => {
    describe("when output option is set to a string", () => {
      beforeEach(() => {
        subject = new Config({ output: "/tmp" });
      });

      it("returns true", () => {
        expect(subject.shouldPublishToDisk).to.equal(true);
      });
    });

    describe("when output option is not set to a string", () => {
      beforeEach(() => {
        subject = new Config({ output: true });
      });

      it("returns false", () => {
        expect(subject.shouldPublishToDisk).to.equal(false);
      });
    });

    describe("when output option is not set", () => {
      beforeEach(() => {
        subject = new Config({});
      });

      it("returns false", () => {
        expect(subject.shouldPublishToDisk).to.equal(false);
      });
    });
  });

  describe(".shouldPublishToS3", () => {
    describe("when publish option is set", () => {
      beforeEach(() => {
        subject = new Config({ publish: "true" });
      });

      it("returns true", () => {
        expect(subject.shouldPublishToS3).to.equal(true);
      });
    });

    describe("when publish option is not set", () => {
      beforeEach(() => {
        subject = new Config({});
      });

      it("returns false", () => {
        expect(subject.shouldPublishToS3).to.equal(false);
      });
    });
  });

  describe(".shouldLogAnalyticsData", () => {
    describe("when shouldPublishToDisk is true", () => {
      beforeEach(() => {
        subject = new Config({ output: "/tmp" });
      });

      it("returns false", () => {
        expect(subject.shouldLogAnalyticsData).to.equal(false);
      });
    });

    describe("when shouldPublishToS3 is true", () => {
      beforeEach(() => {
        subject = new Config({ publish: "true" });
      });

      it("returns false", () => {
        expect(subject.shouldLogAnalyticsData).to.equal(false);
      });
    });

    describe("when shouldPublishToDisk and shouldPublishToS3 are false", () => {
      beforeEach(() => {
        subject = new Config({});
      });

      it("returns false", () => {
        expect(subject.shouldLogAnalyticsData).to.equal(true);
      });
    });
  });

  describe(".shouldWriteToDatabase", () => {
    describe("when write-to-database option is set", () => {
      beforeEach(() => {
        subject = new Config({ "write-to-database": "true" });
      });

      it("returns true", () => {
        expect(subject.shouldWriteToDatabase).to.equal(true);
      });
    });

    describe("when write-to-database option is not set", () => {
      beforeEach(() => {
        subject = new Config({});
      });

      it("returns false", () => {
        expect(subject.shouldWriteToDatabase).to.equal(false);
      });
    });
  });

  describe(".slim", () => {
    describe("when slim option is set", () => {
      beforeEach(() => {
        subject = new Config({ slim: "true" });
      });

      it("returns true", () => {
        expect(subject.slim).to.equal(true);
      });
    });

    describe("when slim option is not set", () => {
      beforeEach(() => {
        subject = new Config({});
      });

      it("returns false", () => {
        expect(subject.slim).to.equal(false);
      });
    });
  });

  describe("ga4CallRetryCount", () => {
    describe("when ANALYTICS_GA4_CALL_RETRY_COUNT is set", () => {
      beforeEach(() => {
        process.env.ANALYTICS_GA4_CALL_RETRY_COUNT = 3;
        subject = new Config();
      });

      afterEach(() => {
        delete process.env.ANALYTICS_GA4_CALL_RETRY_COUNT;
      });

      it("returns the number set in the env var", () => {
        expect(subject.ga4CallRetryCount).to.equal(3);
      });
    });

    describe("when ANALYTICS_GA4_CALL_RETRY_COUNT is not set", () => {
      beforeEach(() => {
        delete process.env.ANALYTICS_GA4_CALL_RETRY_COUNT;
        subject = new Config();
      });

      it("returns the default: 5", () => {
        expect(subject.ga4CallRetryCount).to.equal(5);
      });
    });
  });

  describe("ga4CallRetryDelay", () => {
    describe("when ANALYTICS_GA4_CALL_RETRY_DELAY_MS is set", () => {
      beforeEach(() => {
        process.env.ANALYTICS_GA4_CALL_RETRY_DELAY_MS = 3;
        subject = new Config();
      });

      afterEach(() => {
        delete process.env.ANALYTICS_GA4_CALL_RETRY_DELAY_MS;
      });

      it("returns the number set in the env var", () => {
        expect(subject.ga4CallRetryDelay).to.equal(3);
      });
    });

    describe("when ANALYTICS_GA4_CALL_RETRY_DELAY_MS is not set", () => {
      beforeEach(() => {
        delete process.env.ANALYTICS_GA4_CALL_RETRY_DELAY_MS;
        subject = new Config();
      });

      it("returns the default: 1000", () => {
        expect(subject.ga4CallRetryDelay).to.equal(1000);
      });
    });
  });

  describe("agency", () => {
    describe("when AGENCY_NAME is set", () => {
      beforeEach(() => {
        process.env.AGENCY_NAME = "HUD";
        subject = new Config();
      });

      afterEach(() => {
        delete process.env.AGENCY_NAME;
      });

      it("returns the string set in the env var", () => {
        expect(subject.agency).to.equal("HUD");
      });
    });

    describe("when AGENCY_NAME is not set", () => {
      beforeEach(() => {
        delete process.env.AGENCY_NAME;
        subject = new Config();
      });

      it("returns the default: gov-wide", () => {
        expect(subject.agency).to.equal("gov-wide");
      });
    });
  });

  describe(".script_name", () => {
    const script_name = "daily.sh";

    beforeEach(() => {
      process.env.ANALYTICS_SCRIPT_NAME = script_name;
    });

    afterEach(() => {
      delete process.env.ANALYTICS_SCRIPT_NAME;
    });

    it("return the value of ANALYTICS_SCRIPT_NAME", () => {
      expect(subject.scriptName).to.equal(script_name);
    });
  });

  describe(".email", () => {
    const email = "analytics@games.gov";

    beforeEach(() => {
      process.env.ANALYTICS_REPORT_EMAIL = email;
    });

    afterEach(() => {
      delete process.env.ANALYTICS_REPORT_EMAIL;
    });

    it("return the value of ANALYTICS_REPORT_EMAIL", () => {
      expect(subject.email).to.equal(email);
    });
  });

  describe("logLevel", () => {
    describe("when ANALYTICS_LOG_LEVEL is set", () => {
      beforeEach(() => {
        process.env.ANALYTICS_LOG_LEVEL = "warn";
        subject = new Config();
      });

      afterEach(() => {
        delete process.env.ANALYTICS_LOG_LEVEL;
      });

      it("returns the string set in the env var", () => {
        expect(subject.logLevel).to.equal("warn");
      });
    });

    describe("when ANALYTICS_LOG_LEVEL is not set", () => {
      beforeEach(() => {
        delete process.env.ANALYTICS_LOG_LEVEL;
        subject = new Config();
      });

      it("returns the default: debug", () => {
        expect(subject.logLevel).to.equal("debug");
      });
    });
  });

  describe(".key", () => {
    const key = "1234";

    beforeEach(() => {
      process.env.ANALYTICS_KEY = key;
    });

    afterEach(() => {
      delete process.env.ANALYTICS_KEY;
    });

    it("return the value of ANALYTICS_KEY", () => {
      expect(subject.key).to.equal(key);
    });
  });

  describe(".key_file", () => {
    const keyFile = "my-analytics-key.json";

    describe("when GOOGLE_APPLICATION_CREDENTIALS is set", () => {
      beforeEach(() => {
        process.env.GOOGLE_APPLICATION_CREDENTIALS = keyFile;
      });

      afterEach(() => {
        delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
      });

      it("return the value of GOOGLE_APPLICATION_CREDENTIALS", () => {
        expect(subject.key_file).to.equal(keyFile);
      });
    });

    describe("when ANALYTICS_KEY_PATH is set", () => {
      beforeEach(() => {
        process.env.ANALYTICS_KEY_PATH = keyFile;
      });

      afterEach(() => {
        delete process.env.ANALYTICS_KEY_PATH;
      });

      it("return the value of ANALYTICS_KEY_PATH", () => {
        expect(subject.key_file).to.equal(keyFile);
      });
    });
  });

  describe(".analytics_credentials", () => {
    const analytics_credentials = "1234";

    beforeEach(() => {
      process.env.ANALYTICS_CREDENTIALS = analytics_credentials;
    });

    afterEach(() => {
      delete process.env.ANALYTICS_CREDENTIALS;
    });

    it("return the value of ANALYTICS_CREDENTIALS", () => {
      expect(subject.analytics_credentials).to.equal(analytics_credentials);
    });
  });

  describe(".debug", () => {
    describe("when ANALYTICS_DEBUG is set", () => {
      beforeEach(() => {
        process.env.ANALYTICS_DEBUG = "true";
      });

      afterEach(() => {
        delete process.env.ANALYTICS_DEBUG;
      });

      it("returns true", () => {
        expect(subject.debug).to.equal(true);
      });
    });

    describe("when ANALYTICS_DEBUG is not set", () => {
      beforeEach(() => {
        delete process.env.ANALYTICS_DEBUG;
      });

      it("returns false", () => {
        expect(subject.debug).to.equal(false);
      });
    });
  });

  describe(".aws", () => {
    describe("when ANALYTICS_DEPLOYED_TO_CLOUD_GOV is set", () => {
      beforeEach(() => {
        process.env.ANALYTICS_DEPLOYED_TO_CLOUD_GOV = "true";
        process.env.VCAP_SERVICES = `{
          "s3": [
            {
              "credentials": {
                "uri": "s3://foo:bar@s3-us-gov-west-1.amazonaws.com/abc123",
                "insecure_skip_verify": false,
                "access_key_id": "This is a fake access key",
                "secret_access_key": "This is a fake secret access key",
                "region": "us-gov-west-1",
                "bucket": "abc123",
                "endpoint": "s3-us-gov-west-1.amazonaws.com",
                "fips_endpoint": "s3-fips.us-gov-west-1.amazonaws.com",
                "additional_buckets": []
              }
            }
          ]
        }`;
        process.env.AWS_BUCKET_PATH = "data/live";
        process.env.AWS_CACHE_TIME = "0";
        process.env.AWS_S3_FORCE_STYLE_PATH = "false";
        process.env.AWS_SIGNATURE_VERSION = "foobar";
      });

      afterEach(() => {
        delete process.env.ANALYTICS_DEPLOYED_TO_CLOUD_GOV;
        delete process.env.VCAP_SERVICES;
        delete process.env.AWS_BUCKET_PATH;
        delete process.env.AWS_CACHE_TIME;
        delete process.env.AWS_S3_FORCE_STYLE_PATH;
        delete process.env.AWS_SIGNATURE_VERSION;
      });

      it("returns an AWS config object with the cloud.gov credentials set", () => {
        expect(subject.aws).to.eql({
          bucket: "abc123",
          path: "data/live",
          cache: "0",
          endpoint: "https://s3-us-gov-west-1.amazonaws.com",
          accessKeyId: "This is a fake access key",
          secretAccessKey: "This is a fake secret access key",
          region: "us-gov-west-1",
          s3ForcePathStyle: "false",
          signatureVersion: "foobar",
        });
      });
    });

    describe("when ANALYTICS_DEPLOYED_TO_CLOUD_GOV is not set", () => {
      beforeEach(() => {
        delete process.env.ANALYTICS_DEPLOYED_TO_CLOUD_GOV;
        delete process.env.VCAP_SERVICES;

        process.env.AWS_BUCKET = "abc123";
        process.env.AWS_BUCKET_PATH = "data/live";
        process.env.AWS_CACHE_TIME = "0";
        process.env.AWS_S3_ENDPOINT = "https://s3-us-gov-west-1.amazonaws.com";
        process.env.AWS_S3_FORCE_STYLE_PATH = "false";
        process.env.AWS_SIGNATURE_VERSION = "foobar";
        process.env.AWS_ACCESS_KEY_ID = "This is a fake access key";
        process.env.AWS_SECRET_ACCESS_KEY = "This is a fake secret access key";
        process.env.AWS_REGION = "us-gov-west-1";
      });

      afterEach(() => {
        delete process.env.AWS_BUCKET;
        delete process.env.AWS_BUCKET_PATH;
        delete process.env.AWS_CACHE_TIME;
        delete process.env.AWS_S3_ENDPOINT;
        delete process.env.AWS_S3_FORCE_STYLE_PATH;
        delete process.env.AWS_SIGNATURE_VERSION;
        delete process.env.AWS_ACCESS_KEY_ID;
        delete process.env.AWS_SECRET_ACCESS_KEY;
        delete process.env.AWS_REGION;
      });

      it("returns an AWS config object with the cloud.gov credentials set", () => {
        expect(subject.aws).to.eql({
          bucket: "abc123",
          path: "data/live",
          cache: "0",
          endpoint: "https://s3-us-gov-west-1.amazonaws.com",
          accessKeyId: "This is a fake access key",
          secretAccessKey: "This is a fake secret access key",
          region: "us-gov-west-1",
          s3ForcePathStyle: "false",
          signatureVersion: "foobar",
        });
      });
    });
  });

  describe(".account", () => {
    const accountConfig = {
      ids: "1234",
      agency_name: "HUD",
      hostname: "analytics.usa.gov",
    };

    beforeEach(() => {
      process.env.ANALYTICS_REPORT_IDS = accountConfig.ids;
      process.env.AGENCY_NAME = accountConfig.agency_name;
      process.env.ANALYTICS_HOSTNAME = accountConfig.hostname;
    });

    afterEach(() => {
      delete process.env.ANALYTICS_REPORT_IDS;
      delete process.env.AGENCY_NAME;
      delete process.env.ANALYTICS_HOSTNAME;
    });

    it("return the values from the account env vars", () => {
      expect(subject.account).to.eql(accountConfig);
    });

    describe("when ANALYTICS_HOSTNAME is set", () => {
      const accountConfig = {
        ids: "1234",
        agency_name: "HUD",
        hostname: "analytics.usa.gov",
      };

      beforeEach(() => {
        process.env.ANALYTICS_REPORT_IDS = accountConfig.ids;
        process.env.AGENCY_NAME = accountConfig.agency_name;
        process.env.ANALYTICS_HOSTNAME = accountConfig.hostname;
      });

      afterEach(() => {
        delete process.env.ANALYTICS_REPORT_IDS;
        delete process.env.AGENCY_NAME;
        delete process.env.ANALYTICS_HOSTNAME;
      });

      it("returns the values from the account env vars", () => {
        expect(subject.account).to.eql(accountConfig);
      });
    });

    describe("when ANALYTICS_HOSTNAME is not set", () => {
      const accountConfig = { ids: "1234", agency_name: "HUD", hostname: "" };

      beforeEach(() => {
        process.env.ANALYTICS_REPORT_IDS = accountConfig.ids;
        process.env.AGENCY_NAME = accountConfig.agency_name;
        delete process.env.ANALYTICS_HOSTNAME;
      });

      afterEach(() => {
        delete process.env.ANALYTICS_REPORT_IDS;
        delete process.env.AGENCY_NAME;
      });

      it("returns the values from the account env vars with hostname defaulted", () => {
        expect(subject.account).to.eql(accountConfig);
      });
    });
  });

  describe(".postgres", () => {
    describe("when NODE_ENV is set", () => {
      beforeEach(() => {
        process.env.NODE_ENV = "production";
      });

      afterEach(() => {
        delete process.env.NODE_ENV;
      });

      it("returns the knexfile connection details for the node environment", () => {
        expect(subject.postgres).to.equal(knexfile["production"].connection);
      });
    });

    describe("when NODE_ENV is not set", () => {
      beforeEach(() => {
        delete process.env.NODE_ENV;
      });

      it("returns the knexfile connection details for the development environment", () => {
        expect(subject.postgres).to.equal(knexfile["development"].connection);
      });
    });
  });

  describe(".static", () => {
    it("returns the static path value", () => {
      expect(subject.static).to.eql({ path: "../analytics.usa.gov/" });
    });
  });
});
