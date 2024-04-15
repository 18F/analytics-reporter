const { Before, After } = require("@cucumber/cucumber");
const fs = require("fs");
const { Polly } = require("@pollyjs/core");
const NodeHttpAdapter = require("@pollyjs/adapter-node-http");
const FSPersister = require("@pollyjs/persister-fs");

// Register the adapters and persisters we want to use. This way all future
// polly instances can access them by name.
Polly.register(NodeHttpAdapter);
Polly.register(FSPersister);

// Set the output directory for reports written to disk and create the directory
Before(function () {
  this.outputDir = "./output";
  fs.mkdirSync(this.outputDir);
});

// Disable retries for GA4 calls for the tests.  These can be turned back on
// by overriding the env vars if we choose to test the retry behavior.
Before(function () {
  process.env.ANALYTICS_GA4_CALL_RETRY_COUNT = 0;
  process.env.ANALYTICS_GA4_CALL_RETRY_DELAY_MS = 0;
});

// Set the log level to error to avoid spam in the cucumber output
Before(function () {
  process.env.ANALYTICS_LOG_LEVEL = "error";
});

// Setup Polly for record/replay of HTTP requests within the scenario.
// Set env var RECORD to 'true' to record HTTP requests for the scenario and
// write the recorded requests to the file system. Otherwise Polly will attempt
// to replay requests from the recording file for the scenario and fail the
// scenario if an unrecorded request is made. (This allows integration tests to
// run locally or in CI without making real requests to 3rd party servers.)
Before(function (scenario) {
  const pollyConfig = {
    adapters: ["node-http"],
    persister: "fs",
    persisterOptions: {
      fs: {
        recordingsDir: "./features/__recordings__",
      },
    },
    recordIfMissing: false,
    recordFailedRequests: true,
    flushRequestsOnStop: true,
    mode: process.env.RECORD ? "record" : "replay",
    matchRequestsBy: {
      method: true,
      headers: false, // don't match on headers because there are timestamps
      body: true,
      order: true,
      url: {
        protocol: true,
        username: true,
        password: true,
        hostname: true,
        port: true,
        pathname: true,
        query: true,
        hash: false,
      },
    },
  };

  this.polly = new Polly(getUuid(scenario), pollyConfig);
});

// Use polly to intercept all Google auth requests and respond with a stubbed
// response when in playback mode.
Before(function () {
  if (!process.env.RECORD) {
    const { server } = this.polly;

    server
      .post("https://www.googleapis.com/oauth2/v4/token")
      .intercept((req, res) =>
        res.json({
          content: {
            encoding: "base64",
            mimeType: "application/json; charset=UTF-8",
            size: 1181,
            text: '["Hw==","iw==","CA==","AAAAAAAC/x3USZKjOACF4bt4XVQw2qJ2xjZOyCJJgQHBRoHFJGYxQ0ffvTM63hH+F98/p5iQdBzx1FVpe/pz2mNR/U1+E/4aYr+P8rXg0X33U5wLevlEQBGN59lQiPRxnbmVbhr8Is+VojWAwjqoX5GjgVFr7ghXtSIdod1/IPvbG1lckAcmV8Mz6Z3wU6baT/J3esSDaqXHV0EGFhnD/fhU16dtcfkeLsfj+14rQ+9O4LoPbih6t6ctqixZvulhKQBgQ35ZPhfqadGIyO62Fxj9BDrort6mgLdYGTzKae4/ufen8QAoBiXpIJ6ZP/rgq0TcNLT+d9Vu2/bVkm+u8KJK6WIO5C5eChlQAogYmXNqtc+rhZrN984JPRy8OUdFHxTeHBBxMyImsV6Z94GvhlUs87V95MlTwT6BvRc2+etmSFrz2t6w+pA+vYiHoLmF3aq3N+4rNZNrJxhSe4BuXrjqJQH5EzjDwUSzm86Y6w3VK+MincWqSRZtb+M38Qs7sX3vkoV8Ih5C1S5YhjpqU7rLwjy7Vj4WkbFbbkqbYuMuFyAV0RmO3uF43lkRQ0/6WV02WcFYGc4yNwcAiP7kMGvtqDXxbFD31QsC602q8xn5q9QosRsxyFKH4+RKk0HLWs9ssthM4FAqnaHV7R6KXW7n/LSPZlFXQ6FzfrJpprVkE5RlWtYmdwmrXOH1sG8qMQcOWCkrf77XZ/pFr3K4u3aCZPY+I3U2IXBX3cr0PKidbYwhdP2uv+jdJnKLNuSxWRMqaVSOJwHRLtx6XO18mEyLNEgtm1WySsjP8gPyCLxrt46EApoVQNPuuLUYE1u2xpgbgotiRDruHNQbQTvxiJyjEhhJsvuqv7J15Kas8GGfgWD1lkruqgYkk9WI+LA2pmb8EpaSjGA8SNIBWKeoEkGuKeSx6I1U0V2E+xbzAtYv3W6mtZQVoEpE9ZKEyUppGB2wfoO4dXw+4Nql/olxfo+Z17Je8A5jKMXd1RJU9kmv7S5tWCHb9brvb0NH/lzyMX4vfMnBdfTCqV1DJWJKLi79ts7dMR2Cw7BYu2Gz4UCBodRSdcwDP9ASqMcSFow6yeNDZNsszenp1yndejqkI6Y/HkiKqv46/Y8DnvY+/RFCS+MhHU7//gc00ouzOwQAAA=="]',
          },
        }),
      );
  }
});

After(async function () {
  await this.polly.stop();
});

// Clear and delete the output directory for reports after each scenario.
After(function () {
  fs.rmdirSync(this.outputDir, { recursive: true });
});

function getUuid(scenario) {
  return scenario.pickle.tags[0].name.replace(/@uuid-/g, "");
}
