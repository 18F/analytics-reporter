/**
 * Handles processing a chain of actions
 */
class Processor {
  #actions;

  /**
   * @param {import('../actions/action')[]} actions the chain of actions for the
   * processor.
   */
  constructor(actions = []) {
    this.#actions = actions;
  }

  /**
   * Process a chain of actions with a shared context.
   *
   * @param {import('./report_processing_context')} context the shared context.
   */
  async processChain(context) {
    for (const action of this.#actions) {
      if (action.handles(context)) {
        await action.execute(context);
      }
    }
  }
}

module.exports = Processor;
