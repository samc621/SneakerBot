const Proxy = require("./model");
const response = require("../../helpers/server-response");

exports.createProxy = async (req, res) => {
  try {
    const proxy = await new Proxy().create(req.body);

    return response.Ok(res, "Proxy successfully created", proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getProxy = async (req, res) => {
  try {
    const id = req.params.id;
    const proxy = await new Proxy().findOne({ id });

    return response.Ok(res, "Proxy successfully found", proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getProxies = async (req, res) => {
  try {
    const proxies = await new Proxy().find(req.query);

    return response.Ok(res, "Proxies successfully found", proxies);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateProxy = async (req, res) => {
  try {
    const id = req.params.id;
    const proxy = await new Proxy(id).update(req.body);

    return response.Ok(res, "Proxy successfully updated", proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteProxy = async (req, res) => {
  try {
    const id = req.params.id;
    const proxy = await new Proxy(id).update({ isDeleted: true });

    return response.Ok(res, "Proxy successfully deleted", proxy);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
