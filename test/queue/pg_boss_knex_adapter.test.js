const sinon = require("sinon");
const PgBossKnexAdapter = require("../../src/queue/pg_boss_knex_adapter");

describe("PgBossKnexAdapter", () => {
  let subject;
  let knexInstance;

  beforeEach(async () => {
    knexInstance = {
      raw: sinon.spy(),
    };
    subject = new PgBossKnexAdapter(knexInstance);
  });

  describe(".executeSql", () => {
    describe("when parameters are passed with the SQL statement", () => {
      const sql = "SELECT * FROM foobar-table where foo = $1 and bar = $2";
      const parameters = ["foo", "bar"];
      const expectedSql =
        "SELECT * FROM foobar-table where foo = :param_1 and bar = :param_2";
      const expectedParameters = {
        param_1: parameters[0],
        param_2: parameters[1],
      };

      beforeEach(() => {
        subject.executeSql(sql, parameters);
      });

      it("calls knex.raw with the changed SQL and the parameters array", () => {
        sinon.assert.calledWith(
          knexInstance.raw,
          expectedSql,
          expectedParameters,
        );
      });
    });

    describe("when parameters are not passed with the SQL statement", () => {
      const sql = "SELECT * FROM foobar-table";

      beforeEach(() => {
        subject.executeSql(sql);
      });

      it("calls knex.raw with the unchanged SQL and an empty object for parameters", () => {
        sinon.assert.calledWith(knexInstance.raw, sql, {});
      });
    });
  });
});
