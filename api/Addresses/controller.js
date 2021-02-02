const Address = require('./model');
const response = require('../../helpers/server-response');

exports.createAddress = async (req, res) => {
  try {
    const address = await new Address().create(req.body);

    return response.Ok(res, 'Address successfully created', address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address().findOne({ id });

    return response.Ok(res, 'Address successfully found', address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getAddresses = async (req, res) => {
  try {
    const addresses = await new Address().find(req.query);

    return response.Ok(res, 'Addresses successfully found', addresses);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address(id).update(req.body);

    return response.Ok(res, 'Address successfully updated', address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address(id).update({ is_deleted: true });

    return response.Ok(res, 'Address successfully deleted', address);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
