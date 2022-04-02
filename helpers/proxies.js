import axios from 'axios';
import HttpProxyAgent from 'http-proxy-agent';

export const createProxyString = (proxy) =>
  `${proxy.protocol}://${proxy.username ? `${proxy.username}${proxy.password ? `:${proxy.password}@` : '@'}` : ''}${proxy.ip_address}${
    proxy.port ? `:${proxy.port}` : ''
  }`;

export const testProxy = async (proxyString) => {
  try {
    const httpAgent = new HttpProxyAgent(proxyString);
    const response = await axios.get('http://www.google.com', { httpAgent });
    return response.statusCode === 200;
  } catch (err) {
    return false;
  }
};
