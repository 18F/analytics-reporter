#!/usr/bin/env node

const fs = require("fs");
const { program } = require("commander");
const { formatISO, parseISO, differenceInDays, subDays } = require("date-fns");
const apiReports = require("../reports/api.json");
const { exec } = require("child_process");
const logger = require("../src/logger").initialize();

/**
 * Script to backload DAP API data for a particular date.
 *
 * Example run command:
 * dotenv -e .env.analytics node -- ./backload.js --date 2024-01-01
 */

program
  .option("-d, --date <string>", "date to run the backload for in ISO format")
  .option(
    "-e, --env <string>",
    "dotenv file to load for the process",
    ".env.analytics",
  );

program.parse();

const options = program.opts();
require("dotenv").config({ path: options.env });

const scriptRootPath = `${process.env.ANALYTICS_ROOT_PATH}/deploy`;

const runScriptWithLogName = async (scriptPath, scriptLoggingName) => {
  logger.info(`Beginning: ${scriptLoggingName}`);
  logger.info(`File path: ${scriptPath}`);
  const promise = new Promise((resolve) => {
    const childProcess = exec(scriptPath);
    childProcess.stdout.on("data", (data) => {
      console.log(data.toString().trim());
    });

    childProcess.stderr.on("data", (data) => {
      console.log(data.toString().trim());
    });

    childProcess.on("close", () => {
      resolve();
    });
  });

  await promise;
  fs.unlinkSync("reports/api.json");
  fs.renameSync("reports/api.original.json", "reports/api.json");
};

const api_run = () => {
  return runScriptWithLogName(`${scriptRootPath}/api.sh`, "api.sh");
};

(async () => {
  logger.info("===========================================");
  logger.info("======= STARTING ANALYTICS-REPORTER =======");
  logger.info(`Running /deploy/backload.js for: ${options.date}`);
  logger.info("===========================================");

  const scriptTargetDate = parseISO(options.date);
  const today = new Date();
  let totalDaysAgo = differenceInDays(today, scriptTargetDate);

  while (totalDaysAgo >= 1) {
    const iterationTargetDate = subDays(new Date(), totalDaysAgo);

    const iterationDaysAgo = differenceInDays(today, iterationTargetDate) + 1;
    const modifiedApiJsonString = JSON.stringify(apiReports)
      .replaceAll('"yesterday"', `"${iterationDaysAgo}daysAgo"`)
      .replaceAll('"3daysAgo"', `"${iterationDaysAgo}daysAgo"`);

    fs.unlinkSync("reports/api.json");
    fs.writeFileSync("reports/api.original.json", JSON.stringify(apiReports));
    fs.writeFileSync("reports/api.json", modifiedApiJsonString);
    fs.writeFileSync("reports/api.new.json", modifiedApiJsonString);

    logger.info(
      `Running API reports for ${formatISO(iterationTargetDate, { representation: "date" })}...`,
    );
    await api_run();
    totalDaysAgo = totalDaysAgo - 1;
    logger.info(
      `API reports for ${formatISO(iterationTargetDate, { representation: "date" })} complete`,
    );
  }
})();
