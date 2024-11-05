const expect = require("chai").expect;
const proxyquire = require("proxyquire");

describe("DiskPublisher", () => {
  let DiskPublisher;
  let fs = {};

  beforeEach(() => {
    fs = {
      writeFile: async (path, contents) => {
        return contents;
      },
    };
    DiskPublisher = proxyquire("../../src/publish/disk", {
      "node:fs/promises": fs,
    });
  });

  describe(".publish({ name, data, format, directory })", () => {
    context("when the format is json", () => {
      it("should write the results to <output>/<report name>.json", (done) => {
        const options = { output: "path/to/output", formats: ["json"] };
        const report = { name: "report-name" };
        const results = "I'm the results";

        let fileWritten = false;
        fs.writeFile = async (path, contents) => {
          expect(path).to.equal("path/to/output/report-name.json");
          expect(contents).to.equal("I'm the results");
          fileWritten = true;
          return null;
        };

        DiskPublisher.publish({
          name: report.name,
          data: results,
          format: options.formats[0],
          directory: options.output,
        })
          .then(() => {
            expect(fileWritten).to.be.true;
            done();
          })
          .catch(done);
      });
    });

    context("when the format is csv", () => {
      it("should write the results to <output>/<report name>.csv", () => {
        const options = { output: "path/to/output", formats: ["csv"] };
        const report = { name: "report-name" };
        const results = "I'm the results";

        let fileWritten = false;
        fs.writeFile = async (path, contents) => {
          expect(path).to.equal("path/to/output/report-name.csv");
          expect(contents).to.equal("I'm the results");
          fileWritten = true;
          return null;
        };

        return DiskPublisher.publish({
          name: report.name,
          data: results,
          format: options.formats[0],
          directory: options.output,
        }).then(() => {
          expect(fileWritten).to.be.true;
        });
      });
    });
  });
});
