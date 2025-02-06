const PgBoss = require("pg-boss");
const PgBossKnexAdapter = require("./pg_boss_knex_adapter");
const util = require("util");

/**
 * Implements a message queue using the PgBoss library.
 */
class Queue {
  #queueClient;
  #queueName;
  #messageClass;
  #logger;

  /**
   * @param {object} params the parameter object
   * @param {import('pg-boss')} params.queueClient the queue client instance to
   * use for queue operations.
   * @param {string} params.queueName the identifier for the queue.
   * @param {*} params.messageClass a class which implements the fromMessage
   * static method to return an instance of the class from a PgBoss message
   * object. This can be omitted if the queue instance only sends messages.
   * @param {import('winston').Logger} params.logger an application logger instance.
   */
  constructor({ queueClient, queueName, messageClass, logger }) {
    this.#queueClient = queueClient;
    this.#queueName = queueName;
    this.#messageClass = messageClass;
    this.#logger = logger;
  }

  /**
   * @returns {string} the queue name
   */
  get name() {
    return this.#queueName;
  }

  /**
   * @returns {Promise} resolves when the PgBoss queue client has started
   */
  async start() {
    try {
      await this.#queueClient.start();
      this.#logger.debug("Starting queue client");
    } catch (e) {
      this.#logger.error("Error starting queue client");
      this.#logger.error(util.inspect(e));
      throw e;
    }
  }

  /**
   * @returns {Promise} resolves when the PgBoss queue client has stopped
   */
  async stop() {
    try {
      await this.#queueClient.stop();
      this.#logger.debug(`Stopping queue client`);
    } catch (e) {
      this.#logger.error("Error stopping queue client");
      this.#logger.error(util.inspect(e));
      throw e;
    }
  }

  /**
   * @param {import('./queue_message')} queueMessage a QueueMessage instance
   * @returns {string} a message ID or null if a duplicate message exists on the
   * queue.
   */
  async sendMessage(queueMessage) {
    try {
      this.#logger.info(util.inspect(queueMessage.sendOptions()));
      const messageId = await this.#queueClient.send(
        this.#queueName,
        queueMessage.toJSON(),
        queueMessage.sendOptions(),
      );
      return messageId;
    } catch (e) {
      this.#logger.error(`Error sending to queue: ${this.#queueName}`);
      this.#logger.error(util.inspect(e));
      throw e;
    }
  }

  /**
   * @param {Function} callback the function to call for each message
   * @param {object} options the options to pass to the PgBoss work function
   * @returns {Promise} resolves when the queue poller process stops
   */
  poll(callback, options = { newJobCheckIntervalSeconds: 1 }) {
    return this.#queueClient.work(this.#queueName, options, async (message) => {
      this.#logger.info(
        `Queue message received for ${message.data.reportConfig.query.dateRanges[0].startDate}`,
      );
      await callback(this.#messageClass.fromMessage(message).toJSON());
    });
  }

  /**
   * @param {object} params the parameter object
   * @param {import('knex')} params.knexInstance an initialized instance of the knex
   * library which provides a database connection.
   * @param {string} params.queueName the name of the queue to use for the
   * client.
   * @param {*} params.messageClass a class which implements the fromMessage
   * static method to return an instance of the class from a PgBoss message
   * object. This can be omitted if the queue instance only sends messages.
   * @param {import('winston').Logger} params.logger an application logger instance.
   * @returns {Queue} the queue instance configured with the PgBoss queue
   * client.
   */
  static buildQueue({ knexInstance, queueName, messageClass, logger }) {
    return new Queue({
      queueClient: new PgBoss({ db: new PgBossKnexAdapter(knexInstance) }),
      queueName,
      messageClass,
      logger,
    });
  }
}

module.exports = Queue;
