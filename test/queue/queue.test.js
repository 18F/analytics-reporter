const chai = require("chai");
const sinon = require("sinon");
const Queue = require("../../src/queue/queue");

let expect;
let messageJSON;
let messageOptions;

class TestQueueMessage {
  toJSON() {
    return messageJSON;
  }

  sendOptions() {
    return messageOptions;
  }

  static fromMessage() {
    return new TestQueueMessage();
  }
}

describe("Queue", () => {
  const queueName = "foobar-queue";
  let queueClient;
  const messageClass = TestQueueMessage;
  let logger;
  let subject;

  beforeEach(async () => {
    const chaiAsPromised = await import("chai-as-promised");
    chai.use(chaiAsPromised.default);
    expect = chai.expect;
    queueClient = {
      start: sinon.spy(),
      stop: sinon.spy(),
      send: sinon.spy(),
      work: sinon.spy(),
    };
    logger = {
      info: sinon.spy(),
      error: sinon.spy(),
      debug: sinon.spy(),
    };
    subject = new Queue({ queueName, queueClient, messageClass, logger });
  });

  describe(".name", () => {
    it("returns the queue name", () => {
      expect(subject.name).to.equal(queueName);
    });
  });

  describe(".start", () => {
    describe("when starting the queue client is successful", () => {
      beforeEach(async () => {
        await subject.start();
      });

      it("starts the queue client", () => {
        expect(queueClient.start.calledWith()).to.equal(true);
      });
    });

    describe("when starting the queue client is throws an error", () => {
      beforeEach(async () => {
        queueClient.start = () => {};
        sinon
          .stub(queueClient, "start")
          .throws("Error", "some fake error message");
      });

      it("throws an error", async () => {
        expect(subject.start()).to.eventually.be.rejected;
        expect(queueClient.start.calledWith()).to.equal(true);
        expect(logger.error.calledWith("Error starting queue client")).to.equal(
          true,
        );
      });
    });
  });

  describe(".stop", () => {
    describe("when stopping the queue client is successful", () => {
      beforeEach(async () => {
        await subject.stop();
      });

      it("stops the queue client", () => {
        expect(queueClient.stop.calledWith()).to.equal(true);
      });
    });

    describe("when stopping the queue client is throws an error", () => {
      beforeEach(async () => {
        queueClient.stop = () => {};
        sinon
          .stub(queueClient, "stop")
          .throws("Error", "some fake error message");
      });

      it("throws an error", async () => {
        expect(subject.stop()).to.eventually.be.rejected;
        expect(queueClient.stop.calledWith()).to.equal(true);
        expect(logger.error.calledWith("Error stopping queue client")).to.equal(
          true,
        );
      });
    });
  });

  describe(".sendMessage", () => {
    let queueMessage;

    beforeEach(() => {
      messageJSON = { foo: "bar" };
      messageOptions = { test: 1 };
      queueMessage = new TestQueueMessage();
    });

    describe("when sending a message to the queue is successful", () => {
      let actual;

      describe("and a duplicate message is not found", () => {
        const expected = "a fake job id";

        beforeEach(async () => {
          queueClient.send = () => {};
          sinon.stub(queueClient, "send").returns(expected);
          actual = await subject.sendMessage(queueMessage);
        });

        it("sends the message to the queue with expected JSON and options", () => {
          expect(
            queueClient.send.calledWith(queueName, messageJSON, messageOptions),
          ).to.equal(true);
        });

        it("returns the message ID", () => {
          expect(actual).to.equal(expected);
        });
      });

      describe("and a duplicate message is found", () => {
        const expected = null;

        beforeEach(async () => {
          queueClient.send = () => {};
          sinon.stub(queueClient, "send").returns(expected);
          actual = await subject.sendMessage(queueMessage);
        });

        it("attempts to send the message to the queue with expected JSON and options", () => {
          expect(
            queueClient.send.calledWith(queueName, messageJSON, messageOptions),
          ).to.equal(true);
        });

        it("returns null", () => {
          expect(actual).to.equal(expected);
        });
      });
    });

    describe("when sending a message to the queue is not successful", () => {
      beforeEach(async () => {
        queueClient.send = () => {};
        sinon
          .stub(queueClient, "send")
          .throws("Error", "some fake error message");
      });

      it("throws an error", async () => {
        expect(subject.sendMessage(queueMessage)).to.eventually.be.rejected;
        expect(
          queueClient.send.calledWith(queueName, messageJSON, messageOptions),
        ).to.equal(true);
        expect(
          logger.error.calledWith(`Error sending to queue: ${queueName}`),
        ).to.equal(true);
      });
    });
  });

  describe(".poll", () => {
    describe("when options are not passed", () => {
      const callback = () => {
        return "";
      };

      beforeEach(async () => {
        await subject.poll(callback);
      });

      it("polls the queue with expected options", () => {
        expect(queueClient.work.getCalls()[0].args[0]).to.equal(queueName);
        expect(queueClient.work.getCalls()[0].args[1]).to.deep.equal({
          newJobCheckIntervalSeconds: 1,
        });
        expect(typeof queueClient.work.getCalls()[0].args[2]).to.equal(
          "function",
        );
      });
    });

    describe("when options are passed", () => {
      const callback = () => {
        return "";
      };
      const options = { foo: "bar" };

      beforeEach(async () => {
        await subject.poll(callback, options);
      });

      it("polls the queue with expected options", () => {
        expect(queueClient.work.getCalls()[0].args[0]).to.equal(queueName);
        expect(queueClient.work.getCalls()[0].args[1]).to.deep.equal(options);
        expect(typeof queueClient.work.getCalls()[0].args[2]).to.equal(
          "function",
        );
      });
    });

    xdescribe("polling callback function", () => {
      describe("when the polling callback is executed with a message", () => {
        let callback;
        const message = { foo: "bar" };

        beforeEach(async () => {
          callback = sinon.spy();
          await subject.poll(callback);
          queueClient.work.getCalls()[0].args[2](message);
        });

        it("logs that a message was received", () => {
          sinon.assert.calledWith(logger.info, "Queue message received");
        });

        it("executes the callback with the message JSON", () => {
          expect(callback.calledWith(messageJSON)).to.equal(true);
        });
      });
    });
  });

  describe(".buildQueue", () => {
    it("returns an instance of Queue", () => {
      expect(
        Queue.buildQueue({
          knexInstance: {},
          queueName,
          messageClass: TestQueueMessage,
          logger: {},
        }) instanceof Queue,
      ).to.equal(true);
    });
  });
});
