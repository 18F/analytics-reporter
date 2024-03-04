const expect = require("chai").expect;
const sinon = require("sinon");
const Action = require("../../src/actions/action");

describe("Action", () => {
  let subject;

  describe(".handles", () => {
    beforeEach(() => {
      subject = new Action();
    });

    it("returns true", () => {
      expect(subject.handles()).to.equal(true);
    });
  });

  describe(".execute", () => {
    const errorlogSpy = sinon.spy();
    const context = {
      getStore: () => {
        const map = new Map();
        map.set("logger", { error: errorlogSpy });
        return map;
      },
    };

    describe("when action is successful", () => {
      let promiseExecuted;

      class SuccessfulTestAction extends Action {
        executeStrategy() {
          return new Promise((resolve) => {
            promiseExecuted = true;
            resolve();
          });
        }
      }

      beforeEach((done) => {
        promiseExecuted = false;
        subject = new SuccessfulTestAction();
        subject.execute(context).then(() => {
          done();
        });
      });

      it("executes the strategy and awaits", () => {
        expect(promiseExecuted).to.equal(true);
      });
    });

    describe("when action is successful", () => {
      let promiseExecuted;

      class UnsuccessfulTestAction extends Action {
        executeStrategy() {
          return new Promise((resolve, reject) => {
            promiseExecuted = true;
            reject("you broke it");
          });
        }
      }

      beforeEach((done) => {
        promiseExecuted = false;
        errorlogSpy.resetHistory();
        subject = new UnsuccessfulTestAction();
        subject.execute(context).catch(() => {
          done();
        });
      });

      it("executes the strategy and awaits", () => {
        expect(promiseExecuted).to.equal(true);
      });

      it("logs that there was an error and the class name", () => {
        expect(
          errorlogSpy.calledWith("Error executing UnsuccessfulTestAction"),
        ).to.equal(true);
      });
    });
  });

  describe(".executeStrategy", () => {
    beforeEach(() => {
      subject = new Action();
    });

    it("returns undefined", async () => {
      expect(await subject.executeStrategy()).to.equal(undefined);
    });
  });
});
