"use strict";

/**
 * Configures the code coverage tool NYC.
 */
module.exports = {
  all: true,
  exclude: [
    "coverage",
    "eslint.config.js",
    "knexfile.js",
    "knexfile.cloudgov.js",
    "migrations",
    "newrelic.js",
    "nyc.config.js",
    "node_modules",
    "test",
    // Ignore UA because it will be deprecated
    "ua",
  ],
  branches: 100,
  functions: 100,
  lines: 100,
  statements: 100,
};
