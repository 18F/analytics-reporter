const expect = require("chai").expect;
const sinon = require("sinon");
const Processor = require("../src/processor");

describe("Processor", () => {
  let subject;

  beforeEach(() => {
    subject = new Processor();
  });

  describe(".processChain", () => {
    describe("when action handles the context", () => {
      const action = {
        handles: () => {
          return true;
        },
        execute: sinon.spy(),
      };
      const context = {};

      beforeEach(async () => {
        subject = new Processor([action]);
        await subject.processChain(context);
      });

      it("calls execute on the action", () => {
        expect(action.execute.calledWith(context)).to.equal(true);
      });
    });

    describe("when action does not handle the context", () => {
      const action = {
        handles: () => {
          return false;
        },
        execute: sinon.spy(),
      };
      const context = {};

      beforeEach(async () => {
        subject = new Processor([action]);
        await subject.processChain(context);
      });

      it("does not call execute on the action", () => {
        expect(action.execute.calledWith(context)).to.equal(false);
      });
    });

    describe("when multiple actions are action handles the context", () => {
      const action1 = {
        handles: () => {
          return true;
        },
        execute: sinon.spy(),
      };
      const action2 = {
        handles: () => {
          return true;
        },
        execute: sinon.spy(),
      };
      const context = {};

      beforeEach(async () => {
        subject = new Processor([action1, action2]);
        await subject.processChain(context);
      });

      it("calls execute on each action", () => {
        expect(action1.execute.calledWith(context)).to.equal(true);
        expect(action2.execute.calledWith(context)).to.equal(true);
      });
    });
  });
});
