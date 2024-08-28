const PgBoss = require("pg-boss");

/**
 * Implements a message queue using the PgBoss library.
 */
class Queue {
  #queueClient;
  #queueName;
  #messageClass;

  /**
   * @param {object} params the parameter object
   * @param {import('pg-boss')} params.queueClient the queue client instance to
   * use for queue operations.
   * @param {string} params.queueName the identifier for the queue.
   * @param {*} params.messageClass a class which implements the fromMessage
   * static method to return an instance of the class from a PgBoss message
   * object.
   */
  constructor({ queueClient, queueName, messageClass }) {
    this.#queueClient = queueClient;
    this.#queueName = queueName;
    this.#messageClass = messageClass;
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
  start() {
    return this.#queueClient.start();
  }

  /**
   * @returns {Promise} resolves when the PgBoss queue client has stopped
   */
  stop() {
    return this.#queueClient.stop();
  }

  /**
   * @param {import('./queue_message')} queueMessage a QueueMessage instance
   * @returns {string} a message ID or null if a duplicate message exists on the
   * queue.
   */
  async sendMessage(queueMessage) {
    const result = await this.#queueClient.send(
      this.#queueName,
      queueMessage.toJSON(),
      queueMessage.sendOptions(),
    );
    return result;
  }

  /**
   * @param {Function} callback the function to call for each message
   * @param {object} options the options to pass to the PgBoss work function
   * @returns {Promise} resolves when the queue poller process stops
   */
  async poll(callback, options = { newJobCheckIntervalSeconds: 1 }) {
    const result = await this.#queueClient.work(
      this.#queueName,
      options,
      async (message) => {
        await callback(this.#messageClass.fromMessage(message));
      },
    );
    return result;
  }

  /**
   * @param {object} params the parameter object
   * @param {string} params.connectionString a Postgres database connection
   * string.
   * @param {string} params.queueName the name of the queue to use for the
   * client.
   * @param {*} params.messageClass a class which implements the fromMessage
   * static method to return an instance of the class from a PgBoss message
   * object.
   * @returns {Queue} the queue instance configured with the PgBoss queue
   * client.
   */
  static buildQueue({ connectionString, queueName, messageClass }) {
    return new Queue({
      queueClient: new PgBoss(connectionString),
      queueName,
      messageClass,
    });
  }
}

module.exports = Queue;
