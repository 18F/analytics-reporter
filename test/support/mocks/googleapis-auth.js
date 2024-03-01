const googleAPIsMock = () => {
  function JWT() {
    this.initArguments = arguments;
  }
  JWT.prototype.authorize = (callback) => callback(null, {});
  return { Auth: { JWT } };
};

module.exports = googleAPIsMock;
