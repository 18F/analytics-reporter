if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
// The newrelic module must be required before any module it instruments, so
// this require needs to stay at the top of this file.
const newrelic = require("newrelic");

// Send to HTTP-to-HTTPS upgrading forward proxy in sidecar.
const proxy_url = `http://localhost:${process.env.LOCAL_PROXY_PORT}`;
// Setting this env var is a standard way to enable proxying for HTTP client
// libraries.
process.env.HTTPS_PROXY = proxy_url;
// We have to set the lowercase version as well, because the grpc-js package
// expects it that way. See below:
// https://github.com/grpc/grpc-node/blob/da54e75638d06633303f5071a08ca089806355bf/packages/grpc-js/src/http_proxy.ts#L53
process.env.https_proxy = proxy_url;

const maxListenersExceededWarning = require("max-listeners-exceeded-warning");
maxListenersExceededWarning();

const logger = require("../src/logger").initialize();

logger.info("===================================");
logger.info("=== STARTING ANALYTICS-REPORTER ===");
logger.info("    Running /deploy/consumer.js");
logger.info("===================================");

const run = require("../index.js").runQueueConsume;

(async () => {
  await run({
    // Report each report processing job to NewRelic as a background
    // transaction. Grouping by "JobType" gives the transactions their own entry
    // in the APM transaction type dropdown.
    wrapJob: (name, job) =>
      newrelic.startBackgroundTransaction(name, "JobType", job),
  });
})();
