const rp = require("request-promise");

exports.createProxyString = proxy => {
  return `${proxy.protocol}://${
    proxy.username
      ? `${proxy.username}${proxy.password ? `:${proxy.password}@` : "@"}`
      : ""
  }${proxy.ip_address}${proxy.port ? `:${proxy.port}` : ""}`;
};

exports.testProxy = async proxyString => {
  try {
    const options = {
      uri: "http://www.google.com",
      proxy: proxyString,
      resolveWithFullResponse: true
    };

    const response = await rp(options);
    return response.statusCode === 200 ? true : false;
  } catch (err) {
    return false;
  }
};
