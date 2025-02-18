if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

if (process.env.NEW_RELIC_APP_NAME) {
  require("newrelic");
}

if (
  process.env.PROXY_FQDN &&
  process.env.PROXY_PORT &&
  process.env.PROXY_USERNAME &&
  process.env.PROXY_PASSWORD
) {
  const credentials = encodeURI(
    `${process.env.PROXY_USERNAME}:${process.env.PROXY_PASSWORD}`,
  );
  const proxy_url = `http://${credentials}@${process.env.PROXY_FQDN}:${process.env.PROXY_PORT}`;
  // Setting this env var is a standard way to enable proxying for HTTP client
  // libraries.
  process.env.HTTPS_PROXY = proxy_url;
  // We have to set the lowercase version as well, because the grpc-js package
  // expects it that way. See below:
  // https://github.com/grpc/grpc-node/blob/da54e75638d06633303f5071a08ca089806355bf/packages/grpc-js/src/http_proxy.ts#L53
  process.env.https_proxy = proxy_url;
  // New relic needs it's own special var name to use the proxy.
  process.env.NEW_RELIC_PROXY_URL = proxy_url;
}

const maxListenersExceededWarning = require("max-listeners-exceeded-warning");
maxListenersExceededWarning();

const logger = require("../src/logger").initialize();

logger.info("===================================");
logger.info("=== STARTING ANALYTICS-REPORTER ===");
logger.info("    Running /deploy/consumer.js");
logger.info("===================================");

const run = require("../index.js").runQueueConsume;

(async () => {
  await run();
})();
