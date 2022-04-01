const axios = require('axios').default;
const HttpProxyAgent = require('http-proxy-agent');

exports.createProxyString = (proxy) => `${proxy.protocol}://${proxy.username
  ? `${proxy.username}${proxy.password ? `:${proxy.password}@` : '@'}`
  : ''}${proxy.ip_address}${proxy.port ? `:${proxy.port}` : ''}`;

exports.testProxy = async (proxyString) => {
  try {
    const httpAgent = new HttpProxyAgent(proxyString);
    const response = await axios.get('http://www.google.com', { httpAgent });
    return response.statusCode === 200;
  } catch (err) {
    return false;
  }
};
