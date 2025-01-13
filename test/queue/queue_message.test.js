const expect = require("chai").expect;
const QueueMessage = require("../../src/queue/queue_message");

describe("QueueMessage", () => {
  let subject;

  beforeEach(async () => {
    subject = new QueueMessage();
  });

  describe(".toJSON", () => {
    it("returns an empty object", () => {
      expect(subject.toJSON()).to.deep.equal({});
    });
  });

  describe(".sendOptions", () => {
    it("returns an empty object", () => {
      expect(subject.sendOptions()).to.deep.equal({});
    });
  });

  describe(".fromMessage", () => {
    it("creates a new QueueMessage instance", () => {
      expect(QueueMessage.fromMessage({}) instanceof QueueMessage).to.equal(
        true,
      );
    });
  });
});
