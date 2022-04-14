import Proxy from './model.js';
import { Ok, InternalServerError } from '../../helpers/server-response.js';

const result = (total) => (total ? 'successfully' : 'not');

export const createProxy = async (req, res) => {
  try {
    const proxy = await new Proxy().create(req.body);

    return Ok(res, `Proxy ${result(proxy)} created`, proxy);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const getProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const proxy = await new Proxy().findOne({ id });

    return Ok(res, `Proxy ${result(proxy)} found`, proxy);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const getProxies = async (req, res) => {
  try {
    const proxies = await new Proxy().find(req.query);

    return Ok(res, `Proxies ${result(proxies.length)} found`, proxies);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const updateProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const proxy = await new Proxy(id).update(req.body);

    return Ok(res, `Proxy ${result(proxy)} updated`, proxy);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const deleteProxy = async (req, res) => {
  try {
    const { id } = req.params;
    const proxy = await new Proxy(id).update({ is_deleted: true });

    return Ok(res, `Proxy ${result(proxy)} deleted`, proxy);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};
