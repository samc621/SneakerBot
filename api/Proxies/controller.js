const Proxy = require('./model');
const response = require('../../helpers/server-response');

const result = (total) => (total ? 'successfully' : 'not');

exports.createProxy = async (req, res) => {
  try {
    const proxy = await new Proxy().create(req.body);

    return response.Ok(res, `Proxy ${result(proxy)} created`, proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const proxy = await new Proxy().findOne({ id });

    return response.Ok(res, `Proxy ${result(proxy)} found`, proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getProxies = async (req, res) => {
  try {
    const proxies = await new Proxy().find(req.query);

    return response.Ok(res, `Proxies ${result(proxies.length)} found`, proxies);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const proxy = await new Proxy(id).update(req.body);

    return response.Ok(res, `Proxy ${result(proxy)} updated`, proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const proxy = await new Proxy(id).update({ is_deleted: true });

    return response.Ok(res, `Proxy ${result(proxy)} deleted`, proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
