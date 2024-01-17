const dataFixture = require("../fixtures/data")

const googleAPIsMock = () => {
  function JWT() {
    this.initArguments = arguments
  }
  JWT.prototype.authorize = (callback) => callback(null, {})
  return { auth: { JWT } }
}

module.exports = googleAPIsMock
