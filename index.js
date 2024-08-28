const { AsyncLocalStorage } = require("node:async_hooks");
const util = require("util");
const AppConfig = require("./src/app_config");
const ReportProcessingContext = require("./src/report_processing_context");
const Logger = require("./src/logger");
const Processor = require("./src/processor");
const Queue = require("./src/queue/queue");
const ReportJobQueueMessage = require("./src/queue/report_job_queue_message");

/**
 * Gets an array of JSON report objects from the application confing, then runs
 * a sequential chain of actions on each report object in the array. Some of the
 * actions performed are optional based on the options passed to this function.
 *
 * @param {object} options an object with options to be used when processing
 * all reports.
 * @param {boolean} options.csv if true, format report data to CSV
 * @param {boolean} options.json if true, format report data to JSON
 * @param {string} options.output a string filepath where the analytics data
 * will be written to disk after processing.
 * @param {boolean} options.publish if true, the analytics data will be written
 * to AWS S3 after processing.
 * @param {boolean} options.realtime if true, the application will use the
 * google analytics realtime data reporting API when requesting data.  Otherwise
 * the application uses the non-realtime data reporting API.
 * @param {boolean} options.slim if true, the application will create a smaller
 * data object when formatting the processed data.
 * @param {boolean} options.'write-to-database' if true, the application will
 * write the processed analytics data to the postgres database.
 * @param {string} options.only if set, runs only the report with name
 * matching the passed string.
 * @param {string} options.frequency if set, runs only the reports with
 * frequency matching the passed string.
 */
async function run(options = {}) {
  const appConfig = new AppConfig(options);
  const context = new ReportProcessingContext(new AsyncLocalStorage());
  const reportConfigs = appConfig.filteredReportConfigurations;
  const processor = Processor.buildAnalyticsProcessor(
    appConfig,
    Logger.initialize(appConfig),
  );

  for (const reportConfig of reportConfigs) {
    await _processReport(appConfig, context, reportConfig, processor);
  }
}

/**
 * Creates a new ReportProcessingContext run for the processing of the report.
 * Adds data to the context store which can be used by all actions in the
 * processor chain (config, logger, reportConfig). Catches any errors that
 * occur during processing and logs success or failure. This method does not
 * throw so that subsequent reports will run if an error occurs in a previous
 * report.
 *
 * @param {import('./src/app_config')} appConfig the application config
 * @param {import('./src/report_processing_context')} context the
 * report-specific context for processing.
 * @param {object} reportConfig the configuration object for the analytics
 * report to process.
 * @param {import('./src/processor')} processor an initialized processor
 * instance.
 * @returns {Promise} resolves when processing completes or has an error.
 */
async function _processReport(appConfig, context, reportConfig, processor) {
  return context.run(async () => {
    const logger = Logger.initialize(appConfig, reportConfig);
    context.appConfig = appConfig;
    context.logger = logger;
    context.reportConfig = reportConfig;

    try {
      await processor.processChain(context);
      logger.info("Processing complete");
    } catch (e) {
      logger.error("Encountered an error");
      logger.error(util.inspect(e));
    }
  });
}

/**
 * Gets an array of agencies from the deploy/agencies.json file. Publishes a
 * report job message to the queue for each report and agency based on the
 * startup options.
 *
 * @param {object} options an object with options to be used when processing
 * all reports.
 * @param {boolean} options.csv if true, format report data to CSV
 * @param {boolean} options.json if true, format report data to JSON
 * @param {string} options.output a string filepath where the analytics data
 * will be written to disk after processing.
 * @param {boolean} options.publish if true, the analytics data will be written
 * to AWS S3 after processing.
 * @param {boolean} options.realtime if true, the application will use the
 * google analytics realtime data reporting API when requesting data.  Otherwise
 * the application uses the non-realtime data reporting API.
 * @param {boolean} options.slim if true, the application will create a smaller
 * data object when formatting the processed data.
 * @param {boolean} options.'write-to-database' if true, the application will
 * write the processed analytics data to the postgres database.
 * @param {string} options.only if set, runs only the report with name
 * matching the passed string.
 * @param {string} options.frequency if set, runs only the reports with
 * frequency matching the passed string.
 * @param {string} options.agenciesFile if set, run the queue publisher for all
 * agencies in the JSON file
 */
async function runQueuePublish(options = {}) {
  const agencies = _initAgencies(options.agenciesFile);
  const appConfig = new AppConfig(options);
  const reportConfigs = appConfig.filteredReportConfigurations;
  const appLogger = Logger.initialize({
    agencyName: appConfig.agencyLogName,
    scriptName: appConfig.scriptName,
  });
  const queue = await _initReportJobQueue(appConfig, appLogger);

  for (const agency of agencies) {
    process.env.AGENCY_NAME = agency.agencyName || "";
    for (const reportConfig of reportConfigs) {
      const reportLogger = Logger.initialize({
        agencyName: appConfig.agencyLogName,
        reportName: reportConfig.name,
        scriptName: appConfig.scriptName,
      });
      try {
        let jobId = await queue.sendMessage(
          new ReportJobQueueMessage({
            ...agency,
            reportOptions: options,
            reportConfig,
            scriptName: appConfig.scriptName,
          }),
        );
        if (jobId) {
          reportLogger.info(
            `Created job in queue: ${queue.name} with job ID: ${jobId}`,
          );
        } else {
          reportLogger.info(`Found a duplicate job in queue: ${queue.name}`);
        }
      } catch (e) {
        reportLogger.error(`Error sending to queue: ${queue.name}`);
        reportLogger.error(util.inspect(e));
      }
    }
  }

  _stopQueue(queue, appLogger);
}

function _initAgencies(agencies_file) {
  const legacyAgencies = [
    {
      analyticsReportIds: process.env.ANALYTICS_REPORT_IDS,
      agencyName: process.env.AGENCY_NAME,
      awsBucketPath: process.env.AWS_BUCKET_PATH,
    },
  ];

  if (!agencies_file) {
    return legacyAgencies;
  }

  const agencies = require(agencies_file);
  return Array.isArray(agencies) ? agencies : legacyAgencies;
}

async function _initReportJobQueue(appConfig, logger) {
  const queue = new Queue({
    connectionString: appConfig.messageQueueDatabaseConnection,
    queueName: appConfig.messageQueueName,
    messageClass: ReportJobQueueMessage,
  });
  try {
    await queue.start();
    logger.debug(`Starting ${queue.name} queue client`);
  } catch (e) {
    logger.error(`Error starting ${queue.name} queue client`);
    logger.error(util.inspect(e));
  }
  return queue;
}

async function _stopQueue(queue, logger) {
  try {
    await queue.stop();
    logger.debug(`Stopping ${queue.name} queue client`);
  } catch (e) {
    logger.error(`Error stopping ${queue.name} queue client`);
    logger.error(util.inspect(e));
  }
}

/**
 * Begins a queue consumer process which receives job messages from the
 * analytics report job queue and processes the report for the received job.
 */
async function runQueueConsume() {
  const appConfig = new AppConfig();
  const appLogger = Logger.initialize();
  const queue = await _initReportJobQueue(appConfig, appLogger);

  try {
    const context = new ReportProcessingContext(new AsyncLocalStorage());
    const processor = Processor.buildAnalyticsProcessor(appConfig, appLogger);

    await queue.poll(async (message) => {
      appLogger.info("Queue message received");
      _setProcessEnvForMessage(message);

      await _processReport(
        new AppConfig(message.options),
        context,
        message.reportConfig,
        processor,
      );
    });
  } catch (e) {
    appLogger.error("Error polling queue for messages");
    appLogger.error(util.inspect(e));
  }
}

function _setProcessEnvForMessage(message) {
  process.env.AGENCY_NAME = message.data.agencyName || "";
  process.env.ANALYTICS_REPORT_IDS = message.data.analyticsReportIds || "";
  process.env.AWS_BUCKET_PATH = message.data.awsBucketPath || "";
  process.env.ANALYTICS_SCRIPT_NAME = message.data.scriptName || "";
}

module.exports = { run, runQueuePublish, runQueueConsume };
