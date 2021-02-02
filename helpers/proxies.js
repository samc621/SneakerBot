const rp = require('request-promise');

exports.createProxyString = (proxy) => `${proxy.protocol}://${proxy.username
  ? `${proxy.username}${proxy.password ? `:${proxy.password}@` : '@'}`
  : ''}${proxy.ip_address}${proxy.port ? `:${proxy.port}` : ''}`;

exports.testProxy = async (proxyString) => {
  try {
    const options = {
      uri: 'http://www.google.com',
      proxy: proxyString,
      resolveWithFullResponse: true
    };

    const response = await rp(options);
    return response.statusCode === 200;
  } catch (err) {
    return false;
  }
};
