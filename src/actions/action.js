/**
 * Parent class for actions in a chain of responsibility pattern.
 */
class Action {
  /**
   * Subclasses should override this method if there are instances where the
   * class should not execute on the context.
   *
   * @param {AsyncLocalStorage} context the context for the action chain.
   * @returns {Boolean} true if the action should execute on the context.
   */
  handles() {
    return true;
  }

  /**
   * Executes the logic of the Action using the strategy pattern and writes an
   * error log for debugging if an error occurs in execution.
   *
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async execute(context) {
    const logger = context.getStore().get("logger");
    try {
      await this.executeStrategy(context);
    } catch (e) {
      logger.error(`Error executing ${this.constructor.name}`);
      throw e;
    }
  }

  /**
   * Provides an execution strategy to the execute method. Subclasses should
   * override this method to provide their action specific logic.
   *
   * @param {AsyncLocalStorage} context the context for the action chain.
   */
  async executeStrategy() {
    return;
  }
}

module.exports = Action;
