const rp = require("request-promise");

exports.testProxy = async proxy => {
  try {
    const options = {
      uri: "http://www.google.com",
      proxy,
      resolveWithFullResponse: true
    };

    const response = await rp(options);
    return response.statusCode === 200 ? true : false;
  } catch (err) {
    throw new Error(err.message);
  }
};
