const expect = require("chai").expect;
const sinon = require("sinon");
const Queue = require("../../src/queue/queue");

let messageJSON;
let messageOptions;

class TestQueueMessage {
  toJSON() {
    return messageJSON;
  }

  sendOptions() {
    return messageOptions;
  }

  static fromMessage(message) {
    return message;
  }
}

describe("Queue", () => {
  const queueName = "foobar-queue";
  let queueClient;
  const messageClass = TestQueueMessage;
  let subject;

  beforeEach(() => {
    queueClient = {
      start: sinon.spy(),
      stop: sinon.spy(),
      send: sinon.spy(),
      work: sinon.spy(),
    };
    subject = new Queue({ queueName, queueClient, messageClass });
  });

  describe(".name", () => {
    it("returns the queue name", () => {
      expect(subject.name).to.equal(queueName);
    });
  });

  describe(".start", () => {
    beforeEach(async () => {
      await subject.start();
    });

    it("starts the queue client", () => {
      expect(queueClient.start.calledWith()).to.equal(true);
    });
  });

  describe(".stop", () => {
    beforeEach(async () => {
      await subject.stop();
    });

    it("stops the queue client", () => {
      expect(queueClient.stop.calledWith()).to.equal(true);
    });
  });

  describe(".sendMessage", () => {
    let queueMessage;

    beforeEach(async () => {
      messageJSON = { foo: "bar" };
      messageOptions = { test: 1 };
      queueMessage = new TestQueueMessage();
      await subject.sendMessage(queueMessage);
    });

    it("sends the message to the queue with expected JSON and options", () => {
      expect(
        queueClient.send.calledWith(queueName, messageJSON, messageOptions),
      ).to.equal(true);
    });
  });

  describe(".poll", () => {
    describe("when options are not passed", () => {
      let callback = () => {
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

    describe("when options are passed", () => {});
  });
});
