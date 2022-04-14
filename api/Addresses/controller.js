import Address from './model.js';
import { Ok, InternalServerError } from '../../helpers/server-response.js';

const result = (total) => (total ? 'successfully' : 'not');

export const createAddress = async (req, res) => {
  try {
    const address = await new Address().create(req.body);

    const message = 'Address successfully created';
    return Ok(res, message, address);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const getAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address().findOne({ id });

    const message = `Address ${result(address)} found`;
    return Ok(res, message, address);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const getAddresses = async (req, res) => {
  try {
    const addresses = await new Address().find(req.query);

    const message = `Addresses ${result(addresses.length)} found`;
    return Ok(res, message, addresses);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address(id).update(req.body);

    const message = `Address ${result(address)} updated`;
    return Ok(res, message, address);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const address = await new Address(id).update({ is_deleted: true });

    return Ok(res, `Address ${result(address)} deleted`, address);
  } catch (err) {
    console.error(err.message);
    return InternalServerError(res, err.message);
  }
};
