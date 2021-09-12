const Address = require('./model');
const response = require('../../helpers/server-response');

const result = (total) => (total ? 'successfully' : 'not');

exports.createAddress = async (req, res) => {
  try {
    const address = await new Address().create(req.body);

    const message = 'Address successfully created';
    return response.Ok(res, message, address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address().findOne({ id });

    const message = `Address ${result(address)} found`;
    return response.Ok(res, message, address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await new Address().find(req.query);

    const message = `Addresses ${result(addresses.length)} found`;
    return response.Ok(res, message, addresses);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address(id).update(req.body);

    const message = `Address ${result(address)} updated`;
    return response.Ok(res, message, address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address(id).update({ is_deleted: true });

    return response.Ok(res, `Address ${result(address)} deleted`, address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
